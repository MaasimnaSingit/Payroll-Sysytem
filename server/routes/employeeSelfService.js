const express = require('express');
const fs = require('fs'); const path = require('path'); const multer = require('multer');
const { authRequired, requireRole } = require('../middleware/auth');
const { utcToZonedTime, format } = require('date-fns-tz');
const router = express.Router(); const ZONE='Asia/Manila'; const dbOf=(req)=>req.app.get('db');
const { roundToStep, haversineMeters, lateEarly } = require('../lib/policy');
const { audit } = require('../lib/audit');
const { computeTotalsCross } = require('../lib/compute');
const { allow } = require('../lib/rate');

const nowPH = ()=> utcToZonedTime(new Date(), ZONE);
const ymd = (d)=> format(d,'yyyy-MM-dd',{timeZone:ZONE});
const hm  = (d)=> format(d,'HH:mm',{timeZone:ZONE});
const mins = s=> s && /^\d{2}:\d{2}$/.test(s) ? (s.slice(0,2)*60 + s.slice(3)*1) : null;
function totals(ti,to,br=0){ const a=mins(ti), b=mins(to); if(a==null||b==null||b<=a) return {hours_worked:0,regular_hours:0,overtime_hours:0};
  const w=Math.max(0,(b-a)-Number(br))/60, r=Math.min(8,w), o=Math.max(0,w-8);
  return {hours_worked:+w.toFixed(2), regular_hours:+r.toFixed(2), overtime_hours:+o.toFixed(2)};
}

function storageFor(app){
  return multer.diskStorage({
    destination(_req,_file,cb){
      const d=nowPH(); const root=app.get('uploadsDir')||path.resolve('./uploads');
      const dst=path.join(root,'attendance', String(d.getFullYear()), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0'));
      fs.mkdirSync(dst,{recursive:true}); cb(null,dst);
    },
    filename(req,file,cb){ const d=nowPH(); const ext=file.mimetype==='image/png'?'.png':file.mimetype==='image/webp'?'.webp':'.jpg';
      cb(null, `${req.user.employee_id}-${ymd(d)}-${req._photoKind||'proof'}-${Date.now()}${ext}`); }
  });
}
function uploadFor(app,kind){
  const up = multer({ storage:storageFor(app), fileFilter:(_r,f,cb)=>cb(['image/jpeg','image/png','image/webp'].includes(f.mimetype)?null:new Error('Invalid image type')),
                      limits:{ fileSize: 4*1024*1024 }});
  return (req,res,next)=>{ req._photoKind=kind; up.single('photo')(req,res,(e)=> e?res.status(400).json({error:e.message||'Upload failed'}):next()); };
}

router.post('/time-in', authRequired, requireRole('EMPLOYEE'), uploadFor(router,'in'), (req,res)=>{
  if(!allow(req.user?.uid, 'time-in', 30)) return res.status(429).json({error:'Too many requests'});
  const db=dbOf(req); if(!req.file) return res.status(400).json({error:'Photo is required for time-in'});
  const eid=req.user.employee_id; if(!eid) return res.status(400).json({error:'No employee linked'});
  const d=nowPH(), date=ymd(d), t=hm(d);
  const ex=db.prepare(`SELECT id,time_in FROM attendance WHERE employee_id=? AND work_date=?`).get(eid,date);
  if(ex && ex.time_in) return res.status(409).json({error:'Already time-in today'});
  const settings = Object.fromEntries(db.prepare(`SELECT key,value FROM settings WHERE key IN ('rounding_minutes','workday_start','workday_end','grace_minutes','require_photo_in','require_geo','punch_cooldown_seconds')`).all().map(r=>[r.key,r.value]));
  const lat = req.body?.lat!=null ? Number(req.body.lat) : null;
  const lng = req.body?.lng!=null ? Number(req.body.lng) : null;
  if((settings.require_photo_in||'1')==='1' && !req.file) return res.status(400).json({error:'Photo is required for Time In'});
  if((settings.require_geo||'0')==='1' && (lat==null || lng==null)) return res.status(400).json({error:'Location is required for Time In'});
  const cool = Number(settings.punch_cooldown_seconds||60);
  if(ex?.time_in){
    const [lh,lm] = String(ex.time_in).split(':').map(Number);
    const [nh,nm] = t.split(':').map(Number);
    const lastMin = lh*60+lm, nowMin = nh*60+nm;
    if (Math.abs(nowMin-lastMin) < Math.ceil(cool/60)) return res.status(429).json({error:'Duplicate punch too soon'});
  }
  const rt = roundToStep(t, Number(settings.rounding_minutes||0));
  const id = ex ? (db.prepare(`UPDATE attendance SET time_in=?, status='Present' WHERE id=?`).run(rt,ex.id), ex.id)
                : db.prepare(`INSERT INTO attendance(employee_id,work_date,time_in,break_minutes,status) VALUES(?,? ,?,0,'Present')`)
                    .run(eid,date,rt).lastInsertRowid;
  const rel=`/uploads/attendance/${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${req.file.filename}`.replace(/\\/g,'/');
  let in_distance_m = null, in_in_range = null;
  const emp = db.prepare(`SELECT e.site_id, s.lat AS slat, s.lng AS slng, s.radius_m FROM employees e LEFT JOIN sites s ON s.id=e.site_id WHERE e.id=?`).get(eid);
  if (emp?.site_id && lat!=null && lng!=null) {
    in_distance_m = haversineMeters(lat, lng, emp.slat, emp.slng);
    in_in_range = (in_distance_m!=null && emp.radius_m!=null) ? (in_distance_m <= Number(emp.radius_m)) : null;
    db.prepare(`UPDATE attendance SET in_photo_path=?, in_lat=?, in_lng=?, in_distance_m=?, in_in_range=? WHERE id=?`)
      .run(rel, lat, lng, in_distance_m, in_in_range!=null?Number(in_in_range):null, id);
  } else {
    db.prepare(`UPDATE attendance SET in_photo_path=? WHERE id=?`).run(rel,id);
  }
  const le = lateEarly({ time_in: rt, time_out: null, workday_start: settings.workday_start, workday_end: settings.workday_end, grace_minutes: Number(settings.grace_minutes||0) });
  db.prepare(`UPDATE attendance SET late_minutes=? WHERE id=?`).run(le.late_minutes, id);
  res.json({ ok:true, id, work_date:date, time_in:rt, in_photo_path:rel, in_distance_m, in_in_range });
  try { audit(req, { type:'attendance', action:'time_in', entity:'attendance', entity_id:id, message:`${date} ${t}` }); } catch {}
});

router.post('/time-out', authRequired, requireRole('EMPLOYEE'), uploadFor(router,'out'), (req,res)=>{
  if(!allow(req.user?.uid, 'time-out', 30)) return res.status(429).json({error:'Too many requests'});
  const db=dbOf(req); if(!req.file) return res.status(400).json({error:'Photo is required for time-out'});
  const eid=req.user.employee_id; if(!eid) return res.status(400).json({error:'No employee linked'});
  const d=nowPH(), date=ymd(d), t=hm(d);
  const row=db.prepare(`SELECT a.*, e.employment_type, e.base_rate
                          FROM attendance a JOIN employees e ON e.id=a.employee_id
                         WHERE a.employee_id=? AND a.work_date=?`).get(eid,date);
  if(!row || !row.time_in) return res.status(400).json({error:'Time-in first'});
  if(row.time_out) return res.status(409).json({error:'Already time-out today'});
  const settings = Object.fromEntries(db.prepare(`SELECT key,value FROM settings WHERE key IN ('rounding_minutes','workday_start','workday_end','grace_minutes','require_photo_out','require_geo','allow_cross_midnight','max_shift_hours_soft')`).all().map(r=>[r.key,r.value]));
  const lat = req.body?.lat!=null ? Number(req.body.lat) : null;
  const lng = req.body?.lng!=null ? Number(req.body.lng) : null;
  if((settings.require_photo_out||'1')==='1' && !req.file) return res.status(400).json({error:'Photo is required for Time Out'});
  if((settings.require_geo||'0')==='1' && (lat==null || lng==null)) return res.status(400).json({error:'Location is required for Time Out'});
  const rt = roundToStep(t, Number(settings.rounding_minutes||0));
  const tt = require('../lib/compute').computeTotalsCross(row.time_in, rt, row.break_minutes || 0, (settings.allow_cross_midnight||'0')==='1');
  let pay=0; if(row.employment_type==='Hourly') pay=Number(row.base_rate||0)*tt.hours_worked; else if(row.employment_type==='Daily') pay=Number(row.base_rate||0);
  const rel=`/uploads/attendance/${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${req.file.filename}`.replace(/\\/g,'/');
  let out_distance_m = null, out_in_range = null;
  if (lat!=null && lng!=null) {
    const emp2 = db.prepare(`SELECT e.site_id, s.lat AS slat, s.lng AS slng, s.radius_m FROM employees e LEFT JOIN sites s ON s.id=e.site_id WHERE e.id=?`).get(eid);
    if (emp2?.site_id) {
      out_distance_m = haversineMeters(lat, lng, emp2.slat, emp2.slng);
      out_in_range = (out_distance_m!=null && emp2.radius_m!=null) ? (out_distance_m <= Number(emp2.radius_m)) : null;
      db.prepare(`UPDATE attendance SET out_lat=?, out_lng=?, out_distance_m=?, out_in_range=? WHERE id=?`)
        .run(lat, lng, out_distance_m, out_in_range!=null?Number(out_in_range):null, row.id);
    }
  }
  const le2 = lateEarly({ time_in: row.time_in, time_out: rt, workday_start: settings.workday_start, workday_end: settings.workday_end, grace_minutes: Number(settings.grace_minutes||0) });
  db.prepare(`UPDATE attendance SET time_out=?, hours_worked=?, regular_hours=?, overtime_hours=?, daily_pay=?, out_photo_path=?, early_out_minutes=? WHERE id=?`)
    .run(rt, tt.hours_worked, tt.regular_hours, tt.overtime_hours, Number(pay.toFixed(2)), rel, le2.early_out_minutes, row.id);
  const softMax = Number(settings.max_shift_hours_soft||16);
  const softMaxWarn = softMax>0 && tt.hours_worked>softMax;
  res.json({ ok:true, work_date:date, time_out:rt, ...tt, daily_pay:Number(pay.toFixed(2)), out_photo_path:rel, out_distance_m, out_in_range, softMaxWarn });
  try { audit(req, { type:'attendance', action:'time_out', entity:'attendance', entity_id:row.id, message:`${date} ${t}` }); } catch {}
});

router.get('/my-attendance', authRequired, requireRole('EMPLOYEE'), (req,res)=>{
  const db=dbOf(req); const { from,to }=req.query; if(!from||!to) return res.status(400).json({error:'from & to required'});
  const rows=db.prepare(`SELECT id,work_date,time_in,time_out,break_minutes,status,hours_worked,regular_hours,overtime_hours,daily_pay,notes,in_photo_path,out_photo_path
                           FROM attendance WHERE employee_id=? AND work_date BETWEEN ? AND ? ORDER BY work_date DESC, time_in DESC`)
               .all(req.user.employee_id, from,to);
  res.json({ rows });
});
module.exports = router;


