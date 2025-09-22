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

// Load schema
function loadSchema() {
    try {
        const schemaPath = path.join(__dirname, 'server', 'db', 'schema.sql');
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

// Create admin user with correct password hash
function createAdminUser() {
    try {
        // Correct bcrypt hash for 'Tgpspayroll16**'
        const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO users (username, password, role, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run('Tgpspayroll', hashedPassword, 'admin');
        console.log('Admin user created successfully');
        
        // Verify the user was created
        const checkStmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = checkStmt.get('Tgpspayroll');
        console.log('Admin user verified:', user ? 'Yes' : 'No');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        db.close();
    }
}

createAdminUser();
