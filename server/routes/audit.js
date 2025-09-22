const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db=dbOf(req);
  const { q, type, action, limit=200 } = req.query;
  let sql = `SELECT a.*, u.username
               FROM audit_events a
               LEFT JOIN users u ON u.id=a.actor_user_id
              WHERE 1=1`;
  const args=[];
  if(type){ sql+=` AND a.type=?`; args.push(type); }
  if(action){ sql+=` AND a.action=?`; args.push(action); }
  if(q){ sql+=` AND (a.message LIKE ? OR u.username LIKE ? OR a.entity LIKE ? OR a.entity_id LIKE ?)`;
        args.push(`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`); }
  sql+=` ORDER BY a.created_at DESC LIMIT ?`; args.push(Number(limit));
  res.json({ rows: db.prepare(sql).all(...args) });
});

module.exports = router;


