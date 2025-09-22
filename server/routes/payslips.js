const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const { from, to, employeeId } = req.query;
  if (!from || !to) return res.status(400).json({ error:'from & to required (YYYY-MM-DD)' });

  const srows = db.prepare(`SELECT key,value FROM settings WHERE key IN ('company_name','company_address','company_contact','company_logo_path')`).all();
  const settings = Object.fromEntries(srows.map(r=>[r.key, r.value]));

  let sql = `
    SELECT a.employee_id, a.work_date, a.time_in, a.time_out, a.break_minutes,
           a.regular_hours, a.overtime_hours, a.hours_worked, a.daily_pay,
           e.employee_code, e.name, e.department, e.employment_type, e.base_rate
    FROM attendance a
    JOIN employees e ON e.id = a.employee_id
    WHERE a.work_date BETWEEN ? AND ?`;
  const args = [from, to];
  if (employeeId) { sql += ` AND a.employee_id=?`; args.push(employeeId); }
  sql += ` ORDER BY e.employee_code ASC, a.work_date ASC`;

  const rows = db.prepare(sql).all(...args);

  const byEmp = new Map();
  for (const r of rows) {
    let g = byEmp.get(r.employee_id);
    if (!g) {
      g = {
        employee_id: r.employee_id,
        employee_code: r.employee_code,
        name: r.name,
        department: r.department,
        employment_type: r.employment_type,
        base_rate: Number(r.base_rate||0),
        lines: [],
        totals: { reg:0, ot:0, total:0, gross:0 },
      };
      byEmp.set(r.employee_id, g);
    }
    g.lines.push({
      date: r.work_date,
      in: r.time_in,
      out: r.time_out,
      break: r.break_minutes||0,
      reg: Number(r.regular_hours||0),
      ot: Number(r.overtime_hours||0),
      total: Number(r.hours_worked||0),
      pay: Number(r.daily_pay||0),
    });
    g.totals.reg   += Number(r.regular_hours||0);
    g.totals.ot    += Number(r.overtime_hours||0);
    g.totals.total += Number(r.hours_worked||0);
    g.totals.gross += Number(r.daily_pay||0);
  }

  res.json({
    period: { from, to },
    company: {
      name: settings.company_name || 'Your Company, Inc.',
      address: settings.company_address || '',
      contact: settings.company_contact || '',
      logo: settings.company_logo_path || null,
    },
    slips: Array.from(byEmp.values())
  });
});

module.exports = router;


