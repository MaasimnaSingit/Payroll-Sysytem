const express = require('express');
const { requireRole } = require('../middleware/auth');
const { audit } = require('../lib/audit');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

function valid(date){ return /^\d{4}-\d{2}-\d{2}$/.test(String(date||'')); }

router.get('/status', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const { from, to } = req.query||{};
  if(!valid(from)||!valid(to)) return res.status(400).json({error:'from & to required YYYY-MM-DD'});
  const row = db.prepare(`SELECT id, created_at, actor_user_id AS user_id, total_gross FROM payroll_runs WHERE period_from=? AND period_to=?`).get(from,to);
  res.json({ paid: !!row, run: row || null });
});

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const { limit=50 } = req.query||{};
  const rows = db.prepare(`SELECT * FROM payroll_runs ORDER BY created_at DESC LIMIT ?`).all(Number(limit));
  res.json({ rows });
});

router.post('/mark', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const { from, to, note='' } = req.body||{};
  if(!valid(from)||!valid(to)) return res.status(400).json({error:'from & to required YYYY-MM-DD'});

  const tot = db.prepare(`
    SELECT ROUND(SUM(daily_pay),2) AS gross
    FROM attendance
    WHERE work_date BETWEEN ? AND ?
  `).get(from,to);
  const gross = Number(tot?.gross||0);

  try{
    const info = db.prepare(`INSERT INTO payroll_runs(period_from,period_to,total_gross,note,actor_user_id)
                             VALUES(?,?,?,?,?)`).run(from,to,gross,note,req.user.uid);
    audit(req,{ type:'payroll', action:'mark_paid', entity:'payroll_run', entity_id:info.lastInsertRowid, message:`${from}→${to}`, after:{gross} });
    return res.json({ ok:true, id: info.lastInsertRowid, total_gross: gross });
  }catch(e){
    if(String(e.message||'').includes('UNIQUE')) return res.status(409).json({ error:'This period is already marked as Paid.' });
    throw e;
  }
});

module.exports = router;

router.delete('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const { from, to } = req.body||{};
  if(!valid(from)||!valid(to)) {
    return res.status(400).json({error:'from & to required YYYY-MM-DD'});
  }
  const row = db.prepare(`SELECT id FROM payroll_runs WHERE period_from=? AND period_to=?`).get(from,to);
  if(!row) return res.status(404).json({error:'Not marked as Paid'});
  db.prepare(`DELETE FROM payroll_runs WHERE id=?`).run(row.id);
  require('../lib/audit').audit(req,{ type:'payroll', action:'unmark_paid', entity:'payroll_run', entity_id:row.id, message:`${from}→${to}` });
  res.json({ ok:true });
});


