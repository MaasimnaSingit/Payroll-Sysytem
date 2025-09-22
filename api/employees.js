// Vercel serverless function for employee management
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Database setup for Vercel
const dbPath = process.env.DB_PATH || '/tmp/payroll_system.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
try {
  db = new Database(dbPath);
  
  // Load schema if database is empty
  const schemaPath = path.join(__dirname, '..', 'server', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
} catch (error) {
  console.error('Database connection error:', error);
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get all employees
app.get('/', authenticateToken, (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT 
        id, employee_code, first_name, last_name, middle_name, email, phone,
        address, city, province, postal_code, birth_date, gender, civil_status,
        employment_type, department, position, job_title, base_salary,
        daily_rate, hourly_rate, overtime_rate, sss_no, philhealth_no,
        pagibig_no, tin_no, date_hired, status, created_at, updated_at
      FROM employees 
      WHERE status != 'Deleted'
      ORDER BY created_at DESC
    `).all();
    
    res.json({ success: true, employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
app.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const employee = db.prepare(`
      SELECT 
        id, employee_code, first_name, last_name, middle_name, email, phone,
        address, city, province, postal_code, birth_date, gender, civil_status,
        employment_type, department, position, job_title, base_salary,
        daily_rate, hourly_rate, overtime_rate, sss_no, philhealth_no,
        pagibig_no, tin_no, date_hired, status, created_at, updated_at
      FROM employees 
      WHERE id = ? AND status != 'Deleted'
    `).get(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({ success: true, employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
});

// Create employee
app.post('/', authenticateToken, (req, res) => {
  try {
    const {
      employee_code, first_name, last_name, middle_name, email, phone,
      address, city, province, postal_code, birth_date, gender, civil_status,
      employment_type, department, position, job_title, base_salary,
      sss_no, philhealth_no, pagibig_no, tin_no, date_hired, status = 'Active'
    } = req.body;
    
    // Calculate rates
    const calculatedDailyRate = base_salary / 22; // 22 working days per month
    const calculatedHourlyRate = calculatedDailyRate / 8; // 8 hours per day
    const calculatedOvertimeRate = calculatedHourlyRate * 1.25; // 25% overtime premium
    
    const stmt = db.prepare(`
      INSERT INTO employees (
        employee_code, first_name, last_name, middle_name, email, phone,
        address, city, province, postal_code, birth_date, gender, civil_status,
        employment_type, department, position, job_title, base_salary,
        daily_rate, hourly_rate, overtime_rate, sss_no, philhealth_no,
        pagibig_no, tin_no, date_hired, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      employee_code, first_name, last_name, middle_name, email, phone,
      address, city, province, postal_code, birth_date, gender, civil_status,
      employment_type, department, position, job_title, base_salary,
      calculatedDailyRate, calculatedHourlyRate, calculatedOvertimeRate,
      sss_no, philhealth_no, pagibig_no, tin_no, date_hired, status
    );
    
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({ success: true, employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, error: 'Failed to create employee' });
  }
});

// Update employee
app.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_code, first_name, last_name, middle_name, email, phone,
      address, city, province, postal_code, birth_date, gender, civil_status,
      employment_type, department, position, job_title, base_salary,
      sss_no, philhealth_no, pagibig_no, tin_no, date_hired, status
    } = req.body;
    
    // Calculate rates
    const calculatedDailyRate = base_salary / 22;
    const calculatedHourlyRate = calculatedDailyRate / 8;
    const calculatedOvertimeRate = calculatedHourlyRate * 1.25;
    
    const stmt = db.prepare(`
      UPDATE employees SET
        employee_code = ?, first_name = ?, last_name = ?, middle_name = ?, email = ?, phone = ?,
        address = ?, city = ?, province = ?, postal_code = ?, birth_date = ?, gender = ?, civil_status = ?,
        employment_type = ?, department = ?, position = ?, job_title = ?, base_salary = ?,
        daily_rate = ?, hourly_rate = ?, overtime_rate = ?, sss_no = ?, philhealth_no = ?,
        pagibig_no = ?, tin_no = ?, date_hired = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      employee_code, first_name, last_name, middle_name, email, phone,
      address, city, province, postal_code, birth_date, gender, civil_status,
      employment_type, department, position, job_title, base_salary,
      calculatedDailyRate, calculatedHourlyRate, calculatedOvertimeRate,
      sss_no, philhealth_no, pagibig_no, tin_no, date_hired, status, id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json({ success: true, employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
});

// Delete employee
app.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('UPDATE employees SET status = ? WHERE id = ?');
    const result = stmt.run('Deleted', id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
});

module.exports = app;
