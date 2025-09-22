const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Set up database path
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

// Test data
const testData = {
    employee_id: 9,
    work_date: '2024-12-19',
    time_in: '08:00:00',
    time_out: '17:00:00',
    break_minutes: 60,
    day_type: 'Regular',
    notes: 'Test attendance record'
};

console.log('Testing attendance creation with data:', testData);

try {
    // Check if employee exists
    const employeeStmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    const employee = employeeStmt.get(testData.employee_id);
    console.log('Employee found:', employee ? 'Yes' : 'No');
    
    if (!employee) {
        console.log('Employee not found, creating test employee...');
        const insertEmployee = db.prepare(`
            INSERT INTO employees (
                employee_code, first_name, last_name, email, phone, base_salary, 
                employment_type, department, position, date_hired, gender, civil_status, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const empResult = insertEmployee.run(
            'TEST001', 'Test', 'User', 'test@company.com', '09123456789', 25000,
            'Regular', 'IT', 'Developer', '2024-01-01', 'Male', 'Single', 'Active'
        );
        testData.employee_id = empResult.lastInsertRowid;
        console.log('Created test employee with ID:', testData.employee_id);
    }

    // Test the attendance insert
    const stmt = db.prepare(`
        INSERT INTO attendance (
            employee_id, work_date, time_in, time_out, break_minutes, day_type,
            hours_worked, regular_hours, overtime_hours, night_differential_hours,
            regular_pay, overtime_pay, night_differential_pay, holiday_pay, rest_day_pay, total_daily_pay,
            manual_overtime_hours, notes, is_holiday, holiday_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
        testData.employee_id, testData.work_date, testData.time_in, testData.time_out, 
        testData.break_minutes, testData.day_type,
        8.0, // hours_worked
        8.0, // regular_hours
        0.0, // overtime_hours
        0.0, // night_differential_hours
        1000.0, // regular_pay
        0.0, // overtime_pay
        0.0, // night_differential_pay
        0.0, // holiday_pay
        0.0, // rest_day_pay
        1000.0, // total_daily_pay
        0.0, // manual_overtime_hours
        testData.notes, // notes
        0, // is_holiday
        null // holiday_type
    );
    
    console.log('Attendance created successfully:', result);
    
} catch (error) {
    console.error('Error creating attendance:', error);
    console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
    });
} finally {
    db.close();
}
