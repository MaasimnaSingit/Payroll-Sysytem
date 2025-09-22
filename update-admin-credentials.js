const bcrypt = require('bcryptjs');
const sqlite3 = require('better-sqlite3');
const path = require('path');

// Get database path
const DB_PATH = path.join(process.env.APPDATA || process.env.HOME, 'tgps-payroll', 'payroll_system.db');

// Create database connection
const db = new sqlite3(DB_PATH);

// Hash the new password
const hashedPassword = bcrypt.hashSync('Tgpspayroll16**', 10);

// Update admin credentials
const stmt = db.prepare('UPDATE users SET username = ?, password = ? WHERE role = ?');
const result = stmt.run('Tgpspayroll', hashedPassword, 'admin');

console.log('Admin credentials updated successfully');
console.log('Username: Tgpspayroll');
console.log('Password: Tgpspayroll16**');
console.log('Rows affected:', result.changes);

// Verify the update
const verify = db.prepare('SELECT username, role FROM users WHERE role = ?').get('admin');
console.log('Verification:', verify);

db.close();
