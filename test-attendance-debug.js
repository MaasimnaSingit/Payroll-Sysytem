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

// Test the attendance query
try {
    let query = `
      SELECT 
        a.*,
        e.employee_code, e.first_name, e.last_name, e.middle_name,
        e.employment_type, e.base_salary, e.daily_rate, e.hourly_rate
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
      ORDER BY a.work_date DESC, e.employee_code
    `;
    
    console.log('Testing query:', query);
    
    const stmt = db.prepare(query);
    const records = stmt.all();
    
    console.log('Query executed successfully');
    console.log('Records found:', records.length);
    
    if (records.length > 0) {
        console.log('Sample record:', records[0]);
    }
    
} catch (error) {
    console.error('Error executing query:', error);
}

db.close();