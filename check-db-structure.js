const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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

// Check employees table structure
console.log('\n=== EMPLOYEES TABLE STRUCTURE ===');
try {
    const stmt = db.prepare("PRAGMA table_info(employees)");
    const columns = stmt.all();
    columns.forEach(col => {
        console.log(`${col.name} - ${col.type} - ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
} catch (error) {
    console.error('Error checking employees table:', error);
}

// Check attendance table structure
console.log('\n=== ATTENDANCE TABLE STRUCTURE ===');
try {
    const stmt = db.prepare("PRAGMA table_info(attendance)");
    const columns = stmt.all();
    columns.forEach(col => {
        console.log(`${col.name} - ${col.type} - ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
} catch (error) {
    console.error('Error checking attendance table:', error);
}

// Check if there are any employees
console.log('\n=== EMPLOYEE COUNT ===');
try {
    const count = db.prepare("SELECT COUNT(*) as count FROM employees").get();
    console.log(`Total employees: ${count.count}`);
} catch (error) {
    console.error('Error counting employees:', error);
}

// Check if there are any attendance records
console.log('\n=== ATTENDANCE RECORD COUNT ===');
try {
    const count = db.prepare("SELECT COUNT(*) as count FROM attendance").get();
    console.log(`Total attendance records: ${count.count}`);
} catch (error) {
    console.error('Error counting attendance:', error);
}

db.close();