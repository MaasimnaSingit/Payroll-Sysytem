const express = require('express');
const { requireRole } = require('../middleware/auth');
const { utcToZonedTime, format } = require('date-fns-tz');
const ZONE='Asia/Manila';
const router = express.Router(); const dbOf=(req)=>req.app.get('db');
const todayPH=()=> format(utcToZonedTime(new Date(), ZONE), 'yyyy-MM-dd', {timeZone:ZONE});

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const today=todayPH(); const from=req.query.from||today; const to=req.query.to||today;
  const present=db.prepare(`SELECT COUNT(*) c FROM attendance WHERE work_date=? AND time_in IS NOT NULL AND (status IS NULL OR status!='Absent')`).get(today).c;
  const leave  =db.prepare(`SELECT COUNT(*) c FROM attendance WHERE work_date=? AND status='Leave'`).get(today).c;
  const missing=db.prepare(`SELECT COUNT(*) c FROM attendance WHERE work_date=? AND time_in IS NOT NULL AND time_out IS NULL`).get(today).c;
  const ot     =db.prepare(`SELECT IFNULL(SUM(overtime_hours),0) s FROM attendance WHERE work_date=?`).get(today).s;
  const sums   =db.prepare(`SELECT IFNULL(SUM(regular_hours),0) reg, IFNULL(SUM(overtime_hours),0) ot, IFNULL(SUM(daily_pay),0) gross, COUNT(DISTINCT employee_id) emp
                              FROM attendance WHERE work_date BETWEEN ? AND ?`).get(from,to);
  res.json({ today:{present,leave,missing_out:missing,ot_hours:Number(ot||0)}, period:{from,to,reg_hours:+(sums.reg||0),ot_hours:+(sums.ot||0),gross_pay:+(sums.gross||0),employees:sums.emp||0} });
});

// Last N months gross payroll (default 6)
router.get('/series/payroll', (req, res)=>{
  const db = dbOf(req);
  const months = Math.max(1, Math.min(24, Number(req.query.months||6)));
  const rows = db.prepare(`
    SELECT substr(a.work_date,1,7) AS ym, ROUND(SUM(a.daily_pay),2) AS gross
    FROM attendance a
    WHERE a.work_date >= date('now','start of month', ?)
    GROUP BY ym
    ORDER BY ym ASC
  `).all(`-${months-1} months`);
  res.json({ months, rows });
});

// Period totals (reg vs OT hours and gross)
router.get('/period', (req, res)=>{
  const db = dbOf(req);
  const { from, to } = req.query || {};
  if(!from || !to) return res.status(400).json({ error:'from & to required (YYYY-MM-DD)' });
  const row = db.prepare(`
    SELECT
      ROUND(SUM(regular_hours),2) AS reg_hours,
      ROUND(SUM(overtime_hours),2) AS ot_hours,
      ROUND(SUM(hours_worked),2) AS total_hours,
      ROUND(SUM(daily_pay),2) AS gross
    FROM attendance
    WHERE work_date BETWEEN ? AND ?
  `).get(from, to);
  res.json(row || { reg_hours:0, ot_hours:0, total_hours:0, gross:0 });
});

module.exports = router;

// late & offsite today
router.get('/today-flags', (req,res)=>{
  const db=dbOf(req);
  const today = new Date().toISOString().slice(0,10);
  const late = db.prepare(`SELECT COUNT(*) AS n FROM attendance WHERE work_date=? AND late_minutes>0`).get(today).n || 0;
  const offsite = db.prepare(`SELECT COUNT(*) AS n FROM attendance WHERE work_date=? AND (in_in_range=0 OR out_in_range=0)`).get(today).n || 0;
  res.json({ late, offsite });
});


