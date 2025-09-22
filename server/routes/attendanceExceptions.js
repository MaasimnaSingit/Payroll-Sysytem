const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

function valid(date){ return /^\d{4}-\d{2}-\d{2}$/.test(String(date||'')); }

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req);
  const { from, to, employeeId } = req.query||{};
  if(!valid(from)||!valid(to)) return res.status(400).json({error:'from & to required YYYY-MM-DD'});

  let sql = `
    SELECT a.id, a.employee_id, a.work_date, a.time_in, a.time_out, a.break_minutes,
           a.in_photo_path, a.out_photo_path,
           e.employee_code, e.name
    FROM attendance a
    JOIN employees e ON e.id=a.employee_id
    WHERE a.work_date BETWEEN ? AND ?`;
  const args=[from,to];
  if(employeeId){ sql+=` AND a.employee_id=?`; args.push(employeeId); }
  const rows = db.prepare(sql).all(...args);

  function mins(hm){ if(!hm || !/^\d{2}:\d{2}$/.test(hm)) return null; const [h,m]=hm.split(':').map(Number); return h*60+m; }
  const out = rows.map(r=>{
    const mi=mins(r.time_in), mo=mins(r.time_out), br=Number(r.break_minutes||0);
    let hours = null, neg=false, long=false;
    if(mi!=null && mo!=null){ const diff = (mo-mi)-br; hours = diff/60; neg = diff<0; long = hours>12; }
    const missingIn  = !r.time_in;
    const missingOut = !r.time_out;
    const noInPhoto  = !r.in_photo_path;
    const noOutPhoto = !r.out_photo_path;
    const bad = missingOut || noInPhoto || noOutPhoto || neg || long;
    return { ...r, hours: hours!=null? +hours.toFixed(2): null, missingIn, missingOut, noInPhoto, noOutPhoto, neg, long, bad };
  }).filter(r=>r.bad);

  res.json({ rows: out });
});

module.exports = router;


