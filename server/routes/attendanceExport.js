const express = require('express');
const { requireRole } = require('../middleware/auth');
const dbOf = (req)=>req.app.get('db');

module.exports = (()=>{
  const router = express.Router();

  router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
    const db=dbOf(req);
    const { from, to } = req.query||{};
    if(!from || !to) return res.status(400).json({error:'from & to required'});
    const header = ['employee_code','name','work_date','time_in','time_out','break_minutes','regular_hours','overtime_hours','hours_worked','daily_pay','late_minutes','early_out_minutes','in_distance_m','out_distance_m','in_in_range','out_in_range','in_photo','out_photo','in_lat','in_lng','out_lat','out_lng'];
    const sql = `SELECT e.employee_code, e.name, a.* FROM attendance a JOIN employees e ON e.id=a.employee_id WHERE a.work_date BETWEEN ? AND ?`;
    const rows = db.prepare(sql).all(from,to);
    const body = rows.map(r => [r.employee_code,r.name,r.work_date,r.time_in,r.time_out,r.break_minutes,r.regular_hours,r.overtime_hours,r.hours_worked,r.daily_pay,r.late_minutes,r.early_out_minutes,r.in_distance_m,r.out_distance_m,r.in_in_range,r.out_in_range,r.in_photo_path,r.out_photo_path,r.in_lat,r.in_lng,r.out_lat,r.out_lng]);
    const csv = [header.join(',')].concat(body.map(cols => cols.map(v=>{
      const s = v==null?'':String(v);
      return '"'+s.replace(/"/g,'""')+'"';
    }).join(','))).join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${from}_to_${to}.csv"`);
    res.send(csv);
  });

  return router;
})();


