const express = require('express');
const bcrypt = require('bcryptjs');
const { authRequired, authOptional, signJwt } = require('../middleware/auth');
const router = express.Router();
const { audit } = require('../lib/audit');
const dbOf = (req)=>req.app.get('db');

router.post('/login', (req,res)=>{
  const db = dbOf(req);
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error:'username & password required' });
  const u = db.prepare(`SELECT id,username,password,role,employee_id FROM users WHERE username=?`).get(username);
  if (!u || !bcrypt.compareSync(password, u.password)) return res.status(401).json({ error:'Invalid credentials' });
  const payload = { id:u.id, username:u.username, role:u.role, employee_id:u.employee_id };
  res.json({ token: signJwt(u), user: payload });
  try{ req.user = { uid:u.id, role:u.role }; audit(req, { type:'auth', action:'login', entity:'user', entity_id:u.id, message:`${u.username}` }); }catch{}
});

router.get('/me', authOptional, (req,res)=> res.json({ user:req.user||null }));

router.post('/change-password', authRequired, (req,res)=>{
  const db = dbOf(req);
  const { old_password, new_password } = req.body || {};
  if (!new_password) return res.status(400).json({ error:'new_password required' });
  const row = db.prepare(`SELECT id,password FROM users WHERE id=?`).get(req.user.uid);
  if (!row) return res.status(404).json({ error:'User not found' });
  if (req.user.role !== 'admin') {
    if (!old_password || !bcrypt.compareSync(old_password, row.password)) return res.status(401).json({ error:'Old password incorrect' });
  }
  db.prepare(`UPDATE users SET password=? WHERE id=?`)
    .run(bcrypt.hashSync(String(new_password), 10), req.user.uid);
  res.json({ ok:true });
});

module.exports = router;


