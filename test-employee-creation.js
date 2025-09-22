const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create a test database
const dbPath = path.join(__dirname, 'test-payroll.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

// Load schema
const schemaPath = path.join(__dirname, 'server', 'db', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');
db.exec(sql);

console.log('Database created and schema loaded');

// Test the INSERT statement
const stmt = db.prepare(`
  INSERT INTO employees (
    employee_code, first_name, last_name, middle_name, email, phone, address, city, province, postal_code,
    birth_date, gender, civil_status, employment_type, department, position, job_title,
    base_salary, hourly_rate, daily_rate, sss_no, philhealth_no, pagibig_no, tin_no,
    date_hired, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

try {
  const result = stmt.run(
    'EMP001', 'John', 'Doe', null, 'john.doe@company.com', '09123456789', null, null, null, null,
    null, 'Male', 'Single', 'Regular', 'IT', 'Developer', null,
    25000, 0, 0, null, null, null, null,
    '2024-01-01', 'Active'
  );
  
  console.log('Employee created successfully:', result);
} catch (error) {
  console.error('Error creating employee:', error);
}

// Check the table structure
const tableInfo = db.prepare("PRAGMA table_info(employees)").all();
console.log('Table structure:');
tableInfo.forEach(col => {
  console.log(`${col.cid}: ${col.name} (${col.type})`);
});

db.close();
