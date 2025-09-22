const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('./node_modules/bcrypt');

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

// Create admin user
async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash('Tgpspayroll16**', 10);
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO users (username, password, role, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run('Tgpspayroll', hashedPassword, 'admin');
        console.log('Admin user created successfully');
        
        // Create a test employee
        const employeeStmt = db.prepare(`
            INSERT INTO employees (
                employee_code, first_name, last_name, email, phone, base_salary, 
                employment_type, department, position, date_hired, gender, civil_status, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const empResult = employeeStmt.run(
            'EMP001', 'Test', 'User', 'test@company.com', '09123456789', 25000,
            'Regular', 'IT', 'Developer', '2024-01-01', 'Male', 'Single', 'Active'
        );
        
        console.log('Test employee created with ID:', empResult.lastInsertRowid);
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        db.close();
    }
}

createAdminUser();
