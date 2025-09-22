const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const rows = dbOf(req).prepare(`SELECT * FROM sites ORDER BY name ASC`).all();
  res.json({ rows });
});

router.post('/', requireRole('ADMIN_HR'), (req,res)=>{
  const { name, lat, lng, radius_m=150 } = req.body||{};
  if(!name || lat==null || lng==null) return res.status(400).json({error:'name, lat, lng required'});
  const info = dbOf(req).prepare(`INSERT INTO sites(name,lat,lng,radius_m) VALUES(?,?,?,?)`).run(name, Number(lat), Number(lng), Number(radius_m));
  res.json({ ok:true, id: info.lastInsertRowid });
});

router.put('/:id', requireRole('ADMIN_HR'), (req,res)=>{
  const { id } = req.params; const { name, lat, lng, radius_m } = req.body||{};
  dbOf(req).prepare(`UPDATE sites SET name=COALESCE(?,name), lat=COALESCE(?,lat), lng=COALESCE(?,lng), radius_m=COALESCE(?,radius_m) WHERE id=?`)
    .run(name, lat!=null?Number(lat):null, lng!=null?Number(lng):null, radius_m!=null?Number(radius_m):null, id);
  res.json({ ok:true });
});

router.delete('/:id', requireRole('ADMIN_HR'), (req,res)=>{
  dbOf(req).prepare(`DELETE FROM sites WHERE id=?`).run(req.params.id);
  res.json({ ok:true });
});

module.exports = router;


