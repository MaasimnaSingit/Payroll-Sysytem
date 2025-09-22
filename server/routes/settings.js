const express = require('express');
const { requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path'); const fs = require('fs');
const router = express.Router();
const dbOf = (req)=>req.app.get('db');

const ALLOWED = new Set(['company_name','company_address','company_contact','company_logo_path']);

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const rows = db.prepare(`SELECT key,value FROM settings`).all();
  const out = Object.fromEntries(rows.map(r=>[r.key, r.value]));
  res.json(out);
});

router.put('/', requireRole('ADMIN_HR'), (req,res)=>{
  const db = dbOf(req);
  const data = req.body || {};
  const up = db.prepare(`INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
  let changed = 0;
  for (const [k,v] of Object.entries(data)) {
    if (!ALLOWED.has(k)) continue;
    up.run(k, String(v ?? ''));
    changed++;
  }
  res.json({ ok:true, changed });
});

module.exports = router;

// Logo upload (png/jpg/webp up to 1MB)
function storageFor(app){
  return multer.diskStorage({
    destination(_req,_file,cb){
      const root = app.get('uploadsDir'); const dst = path.join(root, 'branding');
      fs.mkdirSync(dst,{recursive:true}); cb(null,dst);
    },
    filename(_req,file,cb){
      const ext = file.mimetype==='image/png'?'.png':file.mimetype==='image/webp'?'.webp':'.jpg';
      cb(null, `company-logo${ext}`);
    }
  });
}
const upload = (router)=>{
  const up = multer({
    storage: storageFor(router),
    limits:{ fileSize: 1024*1024 },
    fileFilter(_req,file,cb){ cb(['image/png','image/jpeg','image/webp'].includes(file.mimetype)?null:new Error('Invalid image')); }
  });
  return up.single('logo');
};

router.post('/logo', requireRole('ADMIN_HR'), upload(router), (req,res)=>{
  if(!req.file) return res.status(400).json({error:'logo file required'});
  const rel = `/uploads/branding/${req.file.filename}`;
  dbOf(req).prepare(`INSERT INTO settings(key,value) VALUES('company_logo_path',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(rel);
  res.json({ ok:true, company_logo_path: rel });
});


