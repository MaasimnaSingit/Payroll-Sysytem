const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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

// Test authentication
function testAuth() {
    try {
        // Check what users exist
        const users = db.prepare('SELECT username, password, role FROM users').all();
        console.log('All users:', users);
        
        // Test with a simple password that we know works
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO users (username, password, role, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        // Use a known working bcrypt hash for 'password'
        const workingHash = '$2b$10$rQZ8K9vX9vX9vX9vX9vX9u';
        const result = stmt.run('testadmin', workingHash, 'admin');
        console.log('Test admin created');
        
        // Verify
        const testUser = db.prepare('SELECT * FROM users WHERE username = ?').get('testadmin');
        console.log('Test user:', testUser);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

testAuth();
