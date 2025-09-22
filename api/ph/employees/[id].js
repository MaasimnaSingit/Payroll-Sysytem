// Vercel serverless function for individual employee operations
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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
  const schemaPath = path.join(__dirname, '..', '..', '..', '..', 'server', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
} catch (error) {
  console.error('Database connection error:', error);
}

function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access token required', status: 401 };
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid or expired token', status: 403 };
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authenticate token
  const authResult = authenticateToken(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get employee by ID
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
      
      res.status(200).json({ success: true, employee });
    } else if (req.method === 'PUT') {
      // Update employee
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
      res.status(200).json({ success: true, employee });
    } else if (req.method === 'DELETE') {
      // Delete employee (soft delete)
      const stmt = db.prepare('UPDATE employees SET status = ? WHERE id = ?');
      const result = stmt.run('Deleted', id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }
      
      res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Employee API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
