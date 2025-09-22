const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Set up database path (same as server)
const DATA_DIR = path.resolve(process.env.APPDATA || process.env.HOME, 'tgps-payroll');
fs.mkdirSync(DATA_DIR, { recursive: true });
const dbPath = path.join(DATA_DIR, 'payroll_system.db');

console.log('Database path:', dbPath);
console.log('Database exists:', fs.existsSync(dbPath));

let db;
try {
    db = new Database(dbPath);
    console.log('Database connected successfully');
} catch (error) {
    console.error('Error opening database:', error);
    process.exit(1);
}

// Load schema (same as server)
function loadSchema() {
    try {
        const schemaPath = path.join(__dirname, 'server', 'db', 'schema.sql');
        console.log('Schema path:', schemaPath);
        console.log('Schema exists:', fs.existsSync(schemaPath));
        
        if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            console.log('Schema file size:', sql.length, 'characters');
            if (sql && sql.trim()) {
                db.exec(sql);
                console.log('[schema] loaded schema.sql');
            }
        }
    } catch (e) {
        console.warn('[schema] error loading schema:', e.message);
    }
}
loadSchema();

// Check attendance table structure
try {
    const info = db.prepare('PRAGMA table_info(attendance)').all();
    console.log('\nAttendance table structure:');
    info.forEach((col, index) => {
        console.log(`${index}: ${col.name} (${col.type})`);
    });
    
    // Check if hours_worked column exists
    const hasHoursWorked = info.some(col => col.name === 'hours_worked');
    console.log('\nHas hours_worked column:', hasHoursWorked);
    
    // Check if ph_holidays table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\nAll tables:', tables.map(t => t.name));
    
} catch (error) {
    console.error('Error checking table structure:', error);
} finally {
    db.close();
}
