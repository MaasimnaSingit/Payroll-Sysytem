const express = require('express'); const fs = require('fs'); const path = require('path');
const { requireRole } = require('../middleware/auth');
const { audit } = require('../lib/audit');
const router = express.Router();
router.get('/backup', requireRole('ADMIN_HR'), (req,res)=>{
  const dir=req.app.get('userDataDir')||path.resolve('./data');
  const file=fs.readdirSync(dir).find(f=>f.endsWith('.sqlite')||f.endsWith('.db')); if(!file) return res.status(404).json({error:'No sqlite file'});
  const src=path.join(dir,file); const d=new Date(); const p=n=>String(n).padStart(2,'0');
  const name=`backup-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.sqlite`;
  res.setHeader('Content-Disposition',`attachment; filename="${name}"`); res.setHeader('Content-Type','application/octet-stream'); fs.createReadStream(src).pipe(res);
  try { audit(req, { type:'backup', action:'download', entity:'db', message:name }); } catch {}
});
module.exports = router;


