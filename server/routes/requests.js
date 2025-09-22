const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');
const { authRequired, requireRole } = require('../middleware/auth');
const { computeTotals } = require('../lib/compute');
const { nowPH, ymd } = require('../lib/tz');

const router = express.Router();
const dbOf = (req)=>req.app.get('db');

function storageFor(app){
  return multer.diskStorage({
    destination(_req,_file,cb){
      const d = nowPH();
      const root = app.get('uploadsDir') || path.resolve('./uploads');
      const dst = path.join(root, 'requests', String(d.getFullYear()), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0'));
      fs.mkdirSync(dst, { recursive:true });
      cb(null, dst);
    },
    filename(req,file,cb){
      const ext = file.mimetype==='application/pdf' ? '.pdf'
                : file.mimetype==='image/png'       ? '.png'
                : file.mimetype==='image/webp'      ? '.webp'
                : '.jpg';
      cb(null, `${req.user?.employee_id||'emp'}-${Date.now()}${ext}`);
    }
  });
}
const upload = (router)=>{
  const up = multer({
    storage: storageFor(router),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(_req,file,cb){
      const ok = ['image/jpeg','image/png','image/webp','application/pdf'].includes(file.mimetype);
      cb(ok ? null : new Error('Invalid file type'));
    }
  });
  return up.single('attachment');
};

router.post('/', authRequired, requireRole('EMPLOYEE'), upload(router), (req,res)=>{
  const db = dbOf(req);
  const eid = req.user.employee_id;
  const {
    type, work_date, date_from, date_to,
    time_in, time_out, break_minutes, ot_hours, is_paid, reason
  } = req.body || {};

  if (!type || !['TimeCorrection','Overtime','Leave'].includes(type))
    return res.status(400).json({ error:'Invalid type' });

  if ((type==='TimeCorrection' || type==='Overtime') && !work_date)
    return res.status(400).json({ error:'work_date required' });
  if (type==='Leave' && (!date_from || !date_to))
    return res.status(400).json({ error:'date_from and date_to required' });

  const d = nowPH();
  const rel = req.file ? `/uploads/requests/${String(d.getFullYear())}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${req.file.filename}`.replace(/\\/g,'/') : null;

  const info = db.prepare(`INSERT INTO requests
    (employee_id,type,work_date,date_from,date_to,time_in,time_out,break_minutes,ot_hours,is_paid,reason,attachment_path,status)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'Pending')`)
    .run(eid, type, work_date||null, date_from||null, date_to||null, time_in||null, time_out||null, Number(break_minutes||0), ot_hours!=null?Number(ot_hours):null, Number(is_paid?1:0), reason||null, rel);

  db.prepare(`INSERT INTO request_logs(request_id,actor_user_id,action,note)
              VALUES(?,?, 'Submitted', ?)`).run(info.lastInsertRowid, req.user.uid, reason||null);
  try { const { audit } = require('../lib/audit'); audit(req, { type:'requests', action:'submit', entity:'request', entity_id:info.lastInsertRowid, after:{type,work_date,date_from,date_to} }); } catch {}

  res.json({ ok:true, id:info.lastInsertRowid });
});

router.get('/my', authRequired, requireRole('EMPLOYEE'), (req,res)=>{
  const db = dbOf(req);
  const { status, type, from, to } = req.query;
  let sql = `SELECT * FROM requests WHERE employee_id=?`;
  const args = [req.user.employee_id];
  if (status) { sql += ` AND status=?`; args.push(status); }
  if (type)   { sql += ` AND type=?`;   args.push(type); }
  if (from && to) { sql += ` AND (COALESCE(work_date, date_from) BETWEEN ? AND ?)`; args.push(from, to); }
  sql += ` ORDER BY created_at DESC`;
  res.json({ rows: db.prepare(sql).all(...args) });
});

router.get('/pending', authRequired, requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const { type, q, limit=50 } = req.query;
  let sql = `
    SELECT r.*, e.employee_code, e.name
      FROM requests r
      JOIN employees e ON e.id=r.employee_id
     WHERE r.status='Pending'`;
  const args = [];
  if (type) { sql += ` AND r.type=?`; args.push(type); }
  if (q) { sql += ` AND (e.employee_code LIKE ? OR e.name LIKE ?)`; args.push(`%${q}%`,`%${q}%`); }
  sql += ` ORDER BY r.created_at ASC LIMIT ?`; args.push(Number(limit||50));
  res.json({ rows: db.prepare(sql).all(...args) });
});

router.get('/:id', authRequired, (req,res)=>{
  const db = dbOf(req);
  const r = db.prepare(`
    SELECT r.*, e.employee_code, e.name
      FROM requests r JOIN employees e ON e.id=r.employee_id
     WHERE r.id=?`).get(req.params.id);
  if (!r) return res.status(404).json({ error:'Not found' });
  if (req.user.role!=='ADMIN_HR' && req.user.employee_id !== r.employee_id)
    return res.status(403).json({ error:'Forbidden' });
  const logs = db.prepare(`SELECT * FROM request_logs WHERE request_id=? ORDER BY created_at`).all(r.id);
  res.json({ request:r, logs });
});

router.patch('/:id/cancel', authRequired, requireRole('EMPLOYEE'), (req,res)=>{
  const db = dbOf(req);
  const r = db.prepare(`SELECT * FROM requests WHERE id=?`).get(req.params.id);
  if (!r || r.employee_id !== req.user.employee_id) return res.status(404).json({ error:'Not found' });
  if (r.status !== 'Pending') return res.status(400).json({ error:'Only pending can be cancelled' });
  db.prepare(`UPDATE requests SET status='Cancelled', decided_at=datetime('now') WHERE id=?`).run(r.id);
  db.prepare(`INSERT INTO request_logs(request_id,actor_user_id,action) VALUES(?,?,'Cancelled')`)
    .run(r.id, req.user.uid);
  res.json({ ok:true });
  try { const { audit } = require('../lib/audit'); audit(req, { type:'requests', action:'cancel', entity:'request', entity_id:r.id }); } catch {}
});

router.patch('/:id/approve', authRequired, requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const { decision_note } = req.body || {};
  const r = db.prepare(`SELECT * FROM requests WHERE id=?`).get(req.params.id);
  if (!r) return res.status(404).json({ error:'Not found' });
  if (r.status !== 'Pending') return res.status(400).json({ error:'Not pending' });

  if (r.type === 'TimeCorrection') {
    if (!r.work_date || !r.time_in || !r.time_out) return res.status(400).json({ error:'Incomplete time correction' });
    const a = db.prepare(`SELECT a.*, e.employment_type, e.base_rate
                            FROM attendance a JOIN employees e ON e.id=a.employee_id
                           WHERE a.employee_id=? AND a.work_date=?`).get(r.employee_id, r.work_date);
    let id = a?.id;
    if (!a) {
      id = db.prepare(`INSERT INTO attendance(employee_id,work_date,time_in,time_out,break_minutes,status)
                       VALUES(?,?,?,?,?,'Present')`).run(r.employee_id, r.work_date, r.time_in, r.time_out, Number(r.break_minutes||0)).lastInsertRowid;
    } else {
      db.prepare(`UPDATE attendance SET time_in=?, time_out=?, break_minutes=?, status='Present' WHERE id=?`)
        .run(r.time_in, r.time_out, Number(r.break_minutes||0), id);
    }
    const row = db.prepare(`SELECT a.*, e.employment_type, e.base_rate
                              FROM attendance a JOIN employees e ON e.id=a.employee_id
                             WHERE a.id=?`).get(id);
    const t = computeTotals(row.time_in, row.time_out, row.break_minutes||0);
    let pay = 0;
    if (row.employment_type==='Hourly') pay = Number(row.base_rate||0) * t.hours_worked;
    else if (row.employment_type==='Daily') pay = Number(row.base_rate||0);
    db.prepare(`UPDATE attendance SET hours_worked=?, regular_hours=?, overtime_hours=?, daily_pay=? WHERE id=?`)
      .run(t.hours_worked, t.regular_hours, t.overtime_hours, Number(pay.toFixed(2)), id);
  }

  if (r.type === 'Overtime') {
    if (!r.work_date || r.ot_hours==null) return res.status(400).json({ error:'Incomplete overtime request' });
    try {
      db.prepare(`UPDATE attendance SET ot_override=? WHERE employee_id=? AND work_date=?`).run(Number(r.ot_hours), r.employee_id, r.work_date);
    } catch {
      db.prepare(`UPDATE attendance SET overtime_hours=? WHERE employee_id=? AND work_date=?`).run(Number(r.ot_hours), r.employee_id, r.work_date);
    }
  }

  if (r.type === 'Leave') {
    if (!r.date_from || !r.date_to) return res.status(400).json({ error:'Incomplete leave request' });
    const from = new Date(r.date_from), to = new Date(r.date_to);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1)) {
      const date = ymd(d);
      const existing = db.prepare(`SELECT id FROM attendance WHERE employee_id=? AND work_date=?`).get(r.employee_id, date);
      if (existing) {
        db.prepare(`UPDATE attendance SET status='Leave', time_in=NULL, time_out=NULL, break_minutes=0, hours_worked=0, overtime_hours=0, daily_pay=0 WHERE id=?`).run(existing.id);
      } else {
        db.prepare(`INSERT INTO attendance(employee_id,work_date,status,break_minutes,hours_worked,overtime_hours,daily_pay)
                    VALUES(?,?,'Leave',0,0,0,0)`).run(r.employee_id, date);
      }
    }
  }

  db.prepare(`UPDATE requests SET status='Approved', approver_user_id=?, decision_note=?, decided_at=datetime('now') WHERE id=?`)
    .run(req.user.uid, decision_note||null, r.id);
  db.prepare(`INSERT INTO request_logs(request_id,actor_user_id,action,note) VALUES(?,?, 'Approved', ?)`)
    .run(r.id, req.user.uid, decision_note||null);

  res.json({ ok:true });
  try { const { audit } = require('../lib/audit'); audit(req, { type:'requests', action:'approve', entity:'request', entity_id:r.id, message:r.type }); } catch {}
});

router.patch('/:id/reject', authRequired, requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const { decision_note } = req.body || {};
  const r = db.prepare(`SELECT * FROM requests WHERE id=?`).get(req.params.id);
  if (!r) return res.status(404).json({ error:'Not found' });
  if (r.status !== 'Pending') return res.status(400).json({ error:'Not pending' });
  db.prepare(`UPDATE requests SET status='Rejected', approver_user_id=?, decision_note=?, decided_at=datetime('now') WHERE id=?`)
    .run(req.user.uid, decision_note||null, r.id);
  db.prepare(`INSERT INTO request_logs(request_id,actor_user_id,action,note) VALUES(?,?, 'Rejected', ?)`)
    .run(r.id, req.user.uid, decision_note||null);
  res.json({ ok:true });
  try { const { audit } = require('../lib/audit'); audit(req, { type:'requests', action:'reject', entity:'request', entity_id:r.id, message:r.type }); } catch {}
});

module.exports = router;

// Count pending for badge
router.get('/stats/pending', authRequired, requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const row = db.prepare(`SELECT COUNT(*) AS pending FROM requests WHERE status='Pending'`).get();
  res.json({ pending: row.pending || 0 });
});


