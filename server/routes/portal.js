const express = require('express');
const bcrypt = require('bcryptjs');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const { audit } = require('../lib/audit');
const dbOf = (req)=>req.app.get('db');

const randPassword = (n=10)=> Array.from({length:n}, ()=> 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%'.at(Math.floor(Math.random()*62))).join('');

router.post('/invite', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const { employee_id, username } = req.body||{};
  if(!employee_id) return res.status(400).json({error:'employee_id required'});
  const emp = db.prepare(`SELECT id,employee_code,email,name,status FROM employees WHERE id=?`).get(employee_id);
  if(!emp) return res.status(404).json({error:'Employee not found'});
  if(emp.status!=='Active') return res.status(400).json({error:'Employee must be Active'});
  if(db.prepare(`SELECT 1 FROM users WHERE role='EMPLOYEE' AND employee_id=?`).get(employee_id))
    return res.status(409).json({error:'Portal account already exists'});
  const uname = (username || emp.email || emp.employee_code || `emp${emp.id}`).trim();
  if(db.prepare(`SELECT 1 FROM users WHERE username=?`).get(uname))
    return res.status(409).json({error:'Username already taken'});
  const temp = randPassword(); const hash = bcrypt.hashSync(temp,10);
  const info = db.prepare(`INSERT INTO users(username,password_hash,role,employee_id,status,must_change_password)
                           VALUES(?,?,'EMPLOYEE',?,'Active',1)`).run(uname,hash,emp.id);
  res.json({ user_id: info.lastInsertRowid, username: uname, temp_password: temp });
  try { audit(req, { type:'portal', action:'invite', entity:'user', entity_id:info.lastInsertRowid, message:`emp:${employee_id} ${uname}` }); } catch {}
});

router.post('/reset/:userId', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const u = db.prepare(`SELECT id,role FROM users WHERE id=?`).get(req.params.userId);
  if(!u) return res.status(404).json({error:'User not found'});
  if(u.role!=='EMPLOYEE') return res.status(400).json({error:'Not an employee account'});
  const temp = randPassword(); const hash=bcrypt.hashSync(temp,10);
  db.prepare(`UPDATE users SET password_hash=?, must_change_password=1 WHERE id=?`).run(hash,u.id);
  res.json({ user_id:u.id, temp_password:temp });
  try { audit(req, { type:'portal', action:'reset', entity:'user', entity_id:u.id }); } catch {}
});

router.get('/by-employee/:id', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req); const row = db.prepare(`SELECT id as user_id, username FROM users WHERE role='EMPLOYEE' AND employee_id=?`).get(req.params.id);
  if(!row) return res.status(404).json({error:'No portal account'}); res.json(row);
});

module.exports = router;


