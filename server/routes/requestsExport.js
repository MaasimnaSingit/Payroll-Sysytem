const express = require('express');
const { requireRole } = require('../middleware/auth');
const dbOf = (req)=>req.app.get('db');

module.exports = (() => {
  const router = express.Router();
  router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
    const db=dbOf(req);
    const { from, to } = req.query||{};
    if(!from || !to) return res.status(400).json({error:'from & to required'});
    const rows = db.prepare(`
      SELECT r.id, r.type, r.status, r.employee_id, e.employee_code, e.name,
             r.work_date, r.date_from, r.date_to, r.reason, r.created_at, r.decided_at
      FROM requests r
      JOIN employees e ON e.id=r.employee_id
      WHERE (r.work_date BETWEEN ? AND ?)
         OR (r.date_from BETWEEN ? AND ?)
         OR (r.date_to BETWEEN ? AND ?)
      ORDER BY r.created_at DESC
    `).all(from,to, from,to, from,to);
    const head = ['id','type','status','employee_code','name','work_date','date_from','date_to','reason','created_at','decided_at'];
    const csv = [head.join(',')].concat(rows.map(r=> head.map(k=>{
      const v = r[k] != null ? String(r[k]).replace(/"/g,'""') : '';
      return `"${v}"`;
    }).join(','))).join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="requests_${from}_to_${to}.csv"`);
    res.send(csv);
  });
  return router;
})();


