const Database = require('better-sqlite3');
const path = require('path');

// Get database path
const DATA_DIR = path.resolve(process.env.APPDATA || process.env.HOME, 'tgps-payroll');
const dbPath = path.join(DATA_DIR, 'payroll_system.db');

console.log('Database path:', dbPath);

let db;
try {
    db = new Database(dbPath);
    console.log('Database connected successfully');
} catch (error) {
    console.error('Error opening database:', error);
    process.exit(1);
}

// Update admin role to admin (for ph_* endpoints)
try {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE username = ?');
    const result = stmt.run('admin', 'Tgpspayroll');
    
    console.log('Admin role updated successfully');
    console.log('Rows affected:', result.changes);
    
    // Verify the update
    const verify = db.prepare('SELECT username, role FROM users WHERE username = ?').get('Tgpspayroll');
    console.log('Verification:', verify);
    
} catch (error) {
    console.error('Error updating admin role:', error);
} finally {
    db.close();
}