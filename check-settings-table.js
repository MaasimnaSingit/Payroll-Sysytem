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

// Check if settings table exists
console.log('\n=== CHECKING SETTINGS TABLE ===');
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Available tables:', tables.map(t => t.name));
    
    const settingsExists = tables.some(t => t.name === 'settings');
    console.log('Settings table exists:', settingsExists);
    
    if (settingsExists) {
        const settings = db.prepare("SELECT * FROM settings").all();
        console.log('Settings records:', settings);
    } else {
        console.log('Creating settings table...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
        console.log('Settings table created');
    }
    
} catch (error) {
    console.error('Error checking settings table:', error);
}

db.close();