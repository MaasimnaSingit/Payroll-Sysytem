require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json({ limit: '2mb' }));

// security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));

// simple rate limit for auth & uploads
const authLimiter = rateLimit({ windowMs: 5*60*1000, max: 200 });
app.use('/api/auth', authLimiter);
app.use('/api/employee', rateLimit({ windowMs: 5*60*1000, max: 300 }));

// Ensure data directory and open DB
const DATA_DIR = path.resolve(process.env.DATA_DIR || process.env.APPDATA || process.env.HOME, 'tgps-payroll');
fs.mkdirSync(DATA_DIR, { recursive: true });
const dbPath = path.join(DATA_DIR, 'payroll_system.db');
const db = new Database(dbPath);

// Load schema
function loadSchema() {
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      if (sql && sql.trim()) db.exec(sql);
      console.log('[schema] loaded schema.sql');
    }
  } catch (e) {
    console.warn('[schema] error loading schema:', e.message);
  }
}
loadSchema();

// app locals
app.set('db', db);
app.set('userDataDir', DATA_DIR);

// static uploads for proof photos
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || './uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.set('uploadsDir', UPLOADS_DIR);
app.use('/uploads', express.static(UPLOADS_DIR, { immutable: true, maxAge: '365d' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portal', require('./routes/portal'));
app.use('/api/employee', require('./routes/employeeSelfService'));
app.use('/api/admin', require('./routes/adminTools'));
app.use('/api/kpi', require('./routes/kpi'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/attendance-export', require('./routes/attendanceExport'));
app.use('/api/requests-export', require('./routes/requestsExport'));
app.use('/api/recalc', require('./routes/recalc'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/payslips', require('./routes/payslips'));
app.use('/api/payslips-pdf', require('./routes/payslipsPdf'));
app.use('/api/sites', require('./routes/sites'));
app.use('/api/diagnostics', require('./routes/diagnostics'));
app.use('/api/payroll-runs', require('./routes/payrollRuns'));
app.use('/api/attendance-exceptions', require('./routes/attendanceExceptions'));

// Philippines-compliant routes
app.use('/api/ph/employees', require('./routes/ph_employees'));
app.use('/api/ph/attendance', require('./routes/ph_attendance'));
app.use('/api/ph/payroll', require('./routes/ph_payroll'));
app.use('/api/ph/payslips', require('./routes/ph_payslips'));
app.use('/api/ph/leave', require('./routes/ph_leave'));

// production static hosting for built SPA
if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

module.exports = app;

// If run directly, start server
if (require.main === module) {
  const PORT = Number(process.env.PORT || 8080);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://127.0.0.1:${PORT}`);
  });
}


