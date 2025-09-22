// Vercel serverless function for attendance management
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
  const schemaPath = path.join(__dirname, '..', '..', '..', 'server', 'db', 'schema.sql');
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

// Calculate daily pay (simplified version for Vercel)
function calculateDailyPay(employee, timeIn, timeOut, breakMinutes = 0, dayType = 'Regular') {
  try {
    const startTime = new Date(`2000-01-01 ${timeIn}`);
    const endTime = new Date(`2000-01-01 ${timeOut}`);
    
    let hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    hoursWorked -= (breakMinutes || 0) / 60;
    hoursWorked = Math.max(0, hoursWorked);
    
    const regularHours = Math.min(hoursWorked, 8);
    const overtimeHours = Math.max(0, hoursWorked - 8);
    
    const regularPay = regularHours * employee.hourly_rate;
    const overtimePay = overtimeHours * employee.overtime_rate;
    const totalDailyPay = regularPay + overtimePay;
    
    return {
      hours_worked: hoursWorked,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      regular_pay: regularPay,
      overtime_pay: overtimePay,
      night_differential_hours: 0,
      night_differential_pay: 0,
      holiday_pay: 0,
      rest_day_pay: 0,
      total_daily_pay: totalDailyPay,
      is_holiday: false,
      holiday_type: null
    };
  } catch (error) {
    console.error('Error calculating daily pay:', error);
    return {
      hours_worked: 0,
      regular_hours: 0,
      overtime_hours: 0,
      regular_pay: 0,
      overtime_pay: 0,
      night_differential_hours: 0,
      night_differential_pay: 0,
      holiday_pay: 0,
      rest_day_pay: 0,
      total_daily_pay: 0,
      is_holiday: false,
      holiday_type: null
    };
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

  try {
    if (req.method === 'GET') {
      // Get all attendance records
      const { employee_id, start_date, end_date, day_type } = req.query;
      
      let query = `
        SELECT 
          a.*,
          e.employee_code, e.first_name, e.last_name,
          e.employment_type, e.base_salary, e.daily_rate, e.hourly_rate, e.overtime_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (employee_id) {
        query += ' AND a.employee_id = ?';
        params.push(employee_id);
      }
      
      if (start_date) {
        query += ' AND a.work_date >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND a.work_date <= ?';
        params.push(end_date);
      }
      
      if (day_type) {
        query += ' AND a.day_type = ?';
        params.push(day_type);
      }
      
      query += ' ORDER BY a.work_date DESC, e.employee_code';
      
      const stmt = db.prepare(query);
      const records = stmt.all(...params);
      
      res.status(200).json({ success: true, attendance: records });
    } else if (req.method === 'POST') {
      // Create attendance record
      const {
        employee_id, work_date, time_in, time_out, break_minutes = 0,
        day_type = 'Regular', manual_overtime_hours = 0, notes
      } = req.body;
      
      if (!employee_id || !work_date) {
        return res.status(400).json({ success: false, error: 'Missing required fields: employee_id, work_date' });
      }
      
      // Get employee details
      const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND status != "Deleted"').get(employee_id);
      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }
      
      // Calculate pay
      const payData = calculateDailyPay(employee, time_in, time_out, break_minutes, day_type);
      
      const stmt = db.prepare(`
        INSERT INTO attendance (
          employee_id, work_date, time_in, time_out, break_minutes, day_type,
          manual_overtime_hours, notes, hours_worked, regular_hours, overtime_hours,
          night_differential_hours, regular_pay, overtime_pay, night_differential_pay,
          holiday_pay, rest_day_pay, total_daily_pay, is_holiday, holiday_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        employee_id, work_date, time_in, time_out, break_minutes, day_type,
        manual_overtime_hours, notes, payData.hours_worked, payData.regular_hours,
        payData.overtime_hours, payData.night_differential_hours, payData.regular_pay,
        payData.overtime_pay, payData.night_differential_pay, payData.holiday_pay,
        payData.rest_day_pay, payData.total_daily_pay, payData.is_holiday, payData.holiday_type
      );
      
      const attendance = db.prepare('SELECT * FROM attendance WHERE id = ?').get(result.lastInsertRowid);
      
      res.status(200).json({ success: true, attendance });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Attendance API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
