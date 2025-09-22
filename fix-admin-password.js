const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Set up database path (same as server)
const DATA_DIR = path.resolve(process.env.APPDATA || process.env.HOME, 'tgps-payroll');
fs.mkdirSync(DATA_DIR, { recursive: true });
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

// Fix admin user password
function fixAdminPassword() {
    try {
        // Generate correct hash for 'Tgpspayroll16**'
        const password = 'Tgpspayroll16**';
        const correctHash = bcrypt.hashSync(password, 10);
        console.log('Generated correct hash:', correctHash);
        
        // Update admin user with correct password
        const stmt = db.prepare(`
            UPDATE users SET password = ? WHERE username = ?
        `);
        
        const result = stmt.run(correctHash, 'Tgpspayroll');
        console.log('Updated Tgpspayroll user:', result.changes);
        
        // Also update the test admin user
        const result2 = stmt.run(correctHash, 'testadmin');
        console.log('Updated testadmin user:', result2.changes);
        
        // Verify the users
        const users = db.prepare('SELECT username, password, role FROM users').all();
        console.log('All users:', users.map(u => ({ username: u.username, role: u.role, passwordLength: u.password.length })));
        
        // Test password verification
        const testUser = db.prepare('SELECT * FROM users WHERE username = ?').get('Tgpspayroll');
        const isValid = bcrypt.compareSync(password, testUser.password);
        console.log('Password verification test:', isValid);
        
    } catch (error) {
        console.error('Error fixing admin password:', error);
    } finally {
        db.close();
    }
}

fixAdminPassword();
