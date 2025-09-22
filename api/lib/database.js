// Shared database utility for Vercel serverless functions
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDatabase() {
  if (db) {
    return db;
  }
  
  const dbPath = process.env.DB_PATH || '/tmp/payroll_system.db';
  const dbDir = path.dirname(dbPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  try {
    db = new Database(dbPath);
    
    // Load schema if database is empty
    const schemaPath = path.join(__dirname, '..', '..', 'server', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    }
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports = { getDatabase };
