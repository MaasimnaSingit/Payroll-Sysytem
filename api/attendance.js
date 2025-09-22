// Vercel serverless function for attendance management
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

// Calculate daily pay (simplified version for Vercel)
const calculateDailyPay = (employee, timeIn, timeOut, breakMinutes = 0, dayType = 'Regular') => {
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
};

// Get all attendance records
app.get('/', authenticateToken, (req, res) => {
  try {
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
    
    res.json({ success: true, attendance: records });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by ID
app.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const record = db.prepare(`
      SELECT 
        a.*,
        e.employee_code, e.first_name, e.last_name,
        e.employment_type, e.base_salary, e.daily_rate, e.hourly_rate, e.overtime_rate
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `).get(id);
    
    if (!record) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    res.json({ success: true, attendance: record });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance record' });
  }
});

// Create attendance record
app.post('/', authenticateToken, (req, res) => {
  try {
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
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to create attendance record' });
  }
});

// Update attendance record
app.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      work_date, time_in, time_out, break_minutes = 0,
      day_type = 'Regular', manual_overtime_hours = 0, notes
    } = req.body;
    
    // Get existing record
    const existingRecord = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
    if (!existingRecord) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    // Get employee details
    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND status != "Deleted"').get(existingRecord.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Calculate pay
    const payData = calculateDailyPay(employee, time_in, time_out, break_minutes, day_type);
    
    const stmt = db.prepare(`
      UPDATE attendance SET
        work_date = ?, time_in = ?, time_out = ?, break_minutes = ?, day_type = ?,
        manual_overtime_hours = ?, notes = ?, hours_worked = ?, regular_hours = ?,
        overtime_hours = ?, night_differential_hours = ?, regular_pay = ?,
        overtime_pay = ?, night_differential_pay = ?, holiday_pay = ?,
        rest_day_pay = ?, total_daily_pay = ?, is_holiday = ?, holiday_type = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      work_date, time_in, time_out, break_minutes, day_type,
      manual_overtime_hours, notes, payData.hours_worked, payData.regular_hours,
      payData.overtime_hours, payData.night_differential_hours, payData.regular_pay,
      payData.overtime_pay, payData.night_differential_pay, payData.holiday_pay,
      payData.rest_day_pay, payData.total_daily_pay, payData.is_holiday, payData.holiday_type, id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    const attendance = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
app.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM attendance WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attendance record' });
  }
});

module.exports = app;
