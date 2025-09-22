const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const dbOf = (req)=>req.app.get('db');

function exists(p){ try{ fs.accessSync(p, fs.constants.R_OK); return true; }catch{ return false; } }
function writable(p){
  try{
    fs.mkdirSync(p, { recursive:true });
    const tmp = path.join(p, `.probe_${Date.now()}`);
    fs.writeFileSync(tmp, 'ok'); fs.unlinkSync(tmp); return true;
  }catch{ return false; }
}

router.get('/', requireRole('ADMIN_HR'), (req,res)=>{
  try{
    const app = req.app;
    const db = dbOf(req);

  // Paths
  const userDataDir = app.get('userDataDir') || path.resolve(process.cwd(), 'data');
  const uploadsDir = app.get('uploadsDir') || path.join(userDataDir, 'uploads');
  const backupsDir = path.join(userDataDir, 'backups');
  const projRoot = path.resolve(__dirname, '..', '..');
  const migrationsDir = path.join(projRoot, 'migrations');
  const pkgPath = path.join(projRoot, 'package.json');

  // Package info
  let pkg = { name: 'app', version: '0.0.0' };
  try{ pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8')); }catch{}

  // DB size
  let dbSizeBytes = 0;
  try{
    const pageCount = db.prepare(`PRAGMA page_count;`).get()['page_count'] || 0;
    const pageSize  = db.prepare(`PRAGMA page_size;`).get()['page_size'] || 0;
    dbSizeBytes = pageCount * pageSize;
  }catch{}

  // Latest backup
  let lastBackup=null;
  try{
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir).filter(f => /\.(sqlite|db)$/.test(f))
        .map(f => ({ f, m: fs.statSync(path.join(backupsDir,f)).mtimeMs }))
        .sort((a,b)=>b.m-a.m);
      if(files[0]) lastBackup = { file: files[0].f, mtime: new Date(files[0].m).toISOString() };
    }
  }catch{}

  // Check indexes from our migrations
  const indexChecks = [
    'ix_attendance_emp_date',
    'ix_attendance_date',
    'ix_requests_status',
    'ux_employees_code'
  ].map(name=>{
    const row = db.prepare(`SELECT 1 FROM sqlite_master WHERE type='index' AND name=?`).get(name);
    return { name, present: !!row };
  });

  // Basic counts + KPI sanity
  const today = new Date().toISOString().slice(0,10);
  const counts = {
    employees: db.prepare(`SELECT COUNT(*) AS n FROM employees`).get().n || 0,
    attendance_today: db.prepare(`SELECT COUNT(*) AS n FROM attendance WHERE work_date=?`).get(today).n || 0,
    requests_pending: db.prepare(`SELECT COUNT(*) AS n FROM requests WHERE status='Pending'`).get().n || 0,
    payroll_runs: db.prepare(`SELECT COUNT(*) AS n FROM payroll_runs`).get().n || 0,
    audit_events_7d: db.prepare(`SELECT COUNT(*) AS n FROM audit_events WHERE created_at >= datetime('now','-7 days')`).get().n || 0
  };

  // Migrations present on disk
  let migrationsDisk = [];
  try{
    migrationsDisk = fs.existsSync(migrationsDir)
      ? fs.readdirSync(migrationsDir).filter(f=>/^\d+_.*\.sql$/.test(f)).sort()
      : [];
  }catch{}

  // Uploads dir health
  const uploadsExists = exists(uploadsDir);
  const uploadsWritable = writable(uploadsDir);

  // Backup config from env
  const backupCron = process.env.BACKUP_CRON || '';
  const backupKeep = process.env.BACKUP_KEEP || '';

  // CORS info (not exposing secrets)
  const cors = process.env.CORS_ORIGINS || '';

  // Journal mode + FK
  let sqlite = { journal_mode: null, foreign_keys: null };
  try{
    sqlite.journal_mode = db.prepare(`PRAGMA journal_mode;`).get()['journal_mode'];
    sqlite.foreign_keys = db.prepare(`PRAGMA foreign_keys;`).get()['foreign_keys'];
  }catch{}

  res.json({
    app: {
      name: pkg.name, version: pkg.version, node: process.version, platform: `${os.platform()}-${os.arch()}`
    },
    paths: { userDataDir, uploadsDir, backupsDir, migrationsDir, pkgPath },
    env: { BACKUP_CRON: !!backupCron, BACKUP_KEEP: backupKeep || null, CORS_ORIGINS: !!cors },
    db: { size_bytes: dbSizeBytes, journal_mode: sqlite.journal_mode, foreign_keys: sqlite.foreign_keys },
    backups: { configured: !!backupCron, last: lastBackup },
    uploads: { exists: uploadsExists, writable: uploadsWritable },
    indexes: indexChecks,
    counts,
    migrations_disk: migrationsDisk
  });
  }catch(e){
    res.status(200).json({ ok:false, error:'diag-fallback', counts:{employees:0,attendance:0,requests:0} });
  }
});

module.exports = router;


