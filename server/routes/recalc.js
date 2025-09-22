const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const { lateEarly } = require('../lib/policy');
const { audit } = require('../lib/audit');
const dbOf = (req)=>req.app.get('db');

function mins(hhmm){ if(!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null; const [h,m]=hhmm.split(':').map(Number); return h*60+m; }
function totals(ti,to,br=0){ const a=mins(ti), b=mins(to); if(a==null||b==null||b<=a) return {h:0,r:0,o:0};
  const w=Math.max(0,(b-a)-Number(br))/60, r=Math.min(8,w), o=Math.max(0,w-8); return {h:+w.toFixed(2), r:+r.toFixed(2), o:+o.toFixed(2)}; }

router.post('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const { from, to } = req.body || {};
  const rows = from && to
    ? db.prepare(`SELECT a.id,a.time_in,a.time_out,a.break_minutes,e.employment_type,e.base_rate
                    FROM attendance a JOIN employees e ON e.id=a.employee_id
                   WHERE a.work_date BETWEEN ? AND ?`).all(from,to)
    : db.prepare(`SELECT a.id,a.time_in,a.time_out,a.break_minutes,e.employment_type,e.base_rate
                    FROM attendance a JOIN employees e ON e.id=a.employee_id`).all();

  let updated = 0;
  const upd = db.prepare(`UPDATE attendance SET hours_worked=?, regular_hours=?, overtime_hours=?, daily_pay=?, late_minutes=?, early_out_minutes=? WHERE id=?`);
  for (const r of rows) {
    const t = totals(r.time_in, r.time_out, r.break_minutes||0);
    let pay = 0;
    if (r.employment_type==='Hourly') pay = Number(r.base_rate||0) * t.h;
    else if (r.employment_type==='Daily') pay = Number(r.base_rate||0);
    const set = Object.fromEntries(db.prepare(`SELECT key,value FROM settings WHERE key IN ('workday_start','workday_end','grace_minutes')`).all().map(x=>[x.key,x.value]));
    const le = lateEarly({ time_in: r.time_in, time_out: r.time_out, workday_start: set.workday_start, workday_end: set.workday_end, grace_minutes: Number(set.grace_minutes||0) });
    upd.run(t.h, t.r, t.o, Number(pay.toFixed(2)), le.late_minutes, le.early_out_minutes, r.id);
    updated++;
  }
  res.json({ ok:true, updated });
  try { audit(req, { type:'recalc', action:'run', entity:'attendance', message: from&&to ? `${from}→${to}` : 'all', after:{updated} }); } catch {}
});

module.exports = router;


