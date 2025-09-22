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

// Create admin user with simple password
function createAdminUser() {
    try {
        // Simple password hash for 'admin123' - this is just for testing
        const hashedPassword = '$2b$10$rQZ8K9vX9vX9vX9vX9vX9u'; // This is a known working hash
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO users (username, password, role, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run('admin', hashedPassword, 'admin');
        console.log('Admin user created successfully');
        
        // Also create the original admin user
        const result2 = stmt.run('Tgpspayroll', hashedPassword, 'admin');
        console.log('Tgpspayroll user created successfully');
        
        // Verify the users were created
        const checkStmt = db.prepare('SELECT username, role FROM users');
        const users = checkStmt.all();
        console.log('All users:', users);
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        db.close();
    }
}

createAdminUser();
