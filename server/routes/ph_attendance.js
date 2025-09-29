// Philippines-compliant Attendance Management API
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const phPayroll = require('../lib/ph_payroll');

// Get attendance records with PH calculations
router.get('/', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { employee_id, start_date, end_date, day_type } = req.query;
    
    let query = `
      SELECT 
        a.*,
        e.employee_code, e.first_name, e.last_name, e.middle_name,
        e.employment_type, e.base_salary, e.daily_rate, e.hourly_rate
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
    
    // Format currency and dates
    const formattedRecords = records.map(record => ({
      ...record,
      work_date_formatted: phPayroll.formatDate(record.work_date),
      regular_pay_formatted: phPayroll.formatCurrency(record.regular_pay),
      overtime_pay_formatted: phPayroll.formatCurrency(record.overtime_pay),
      night_differential_pay_formatted: phPayroll.formatCurrency(record.night_differential_pay),
      holiday_pay_formatted: phPayroll.formatCurrency(record.holiday_pay),
      rest_day_pay_formatted: phPayroll.formatCurrency(record.rest_day_pay),
      total_daily_pay_formatted: phPayroll.formatCurrency(record.total_daily_pay)
    }));
    
    res.json({ success: true, attendance: formattedRecords });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

// Create attendance record with PH calculations
router.post('/', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      employee_id, work_date, time_in, time_out, break_minutes = 0,
      day_type = 'Regular', manual_overtime_hours = 0, notes
    } = req.body;
    
    // Validate required fields
    if (!employee_id || !work_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: employee_id, work_date' 
      });
    }
    
    // Get employee data
    const empStmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    const employee = empStmt.get(employee_id);
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Check if attendance already exists for this date
    const checkStmt = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND work_date = ?');
    const existing = checkStmt.get(employee_id, work_date);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Attendance already exists for this date' });
    }
    
    // Calculate PH-compliant pay
    const payCalculation = phPayroll.calculateDailyPay(employee, {
      time_in, time_out, break_minutes, day_type, manual_overtime_hours
    }, 'Regular', db);
    
    // Insert attendance record
    const stmt = db.prepare(`
      INSERT INTO attendance (
        employee_id, work_date, time_in, time_out, break_minutes, day_type,
        hours_worked, regular_hours, overtime_hours, night_differential_hours,
        regular_pay, overtime_pay, night_differential_pay, holiday_pay, rest_day_pay, total_daily_pay,
        manual_overtime_hours, notes, is_holiday, holiday_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      employee_id, work_date, time_in, time_out, break_minutes, day_type,
      phPayroll.calculateTotalHours(time_in, time_out, break_minutes),
      payCalculation.regular_hours, payCalculation.overtime_hours, payCalculation.night_differential_hours,
      payCalculation.regular_pay, payCalculation.overtime_pay, payCalculation.night_differential_pay,
      payCalculation.holiday_pay, payCalculation.rest_day_pay, payCalculation.total_daily_pay,
      manual_overtime_hours, notes, payCalculation.is_holiday, payCalculation.holiday_type
    );
    
    res.json({ 
      success: true, 
      message: 'Attendance recorded successfully',
      attendance_id: result.lastInsertRowid,
      calculation: payCalculation
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create attendance record',
      details: error.message 
    });
  }
});

// Update attendance record
router.put('/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const attendanceId = req.params.id;
    const updateData = req.body;
    
    // Check if attendance exists
    const checkStmt = db.prepare('SELECT * FROM attendance WHERE id = ?');
    const existing = checkStmt.get(attendanceId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    // Get employee data for recalculation
    const empStmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    const employee = empStmt.get(existing.employee_id);
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Merge existing data with updates
    const updatedAttendance = { ...existing, ...updateData };
    
    // Recalculate PH-compliant pay
    const payCalculation = phPayroll.calculateDailyPay(employee, updatedAttendance, 'Regular', db);
    
    // Update attendance record
    const stmt = db.prepare(`
      UPDATE attendance SET 
        time_in = ?, time_out = ?, break_minutes = ?, day_type = ?,
        hours_worked = ?, regular_hours = ?, overtime_hours = ?, night_differential_hours = ?,
        regular_pay = ?, overtime_pay = ?, night_differential_pay = ?, holiday_pay = ?, rest_day_pay = ?, total_daily_pay = ?,
        manual_overtime_hours = ?, notes = ?, is_holiday = ?, holiday_type = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(
      updatedAttendance.time_in, updatedAttendance.time_out, updatedAttendance.break_minutes, updatedAttendance.day_type,
      phPayroll.calculateTotalHours(updatedAttendance.time_in, updatedAttendance.time_out, updatedAttendance.break_minutes),
      payCalculation.regular_hours, payCalculation.overtime_hours, payCalculation.night_differential_hours,
      payCalculation.regular_pay, payCalculation.overtime_pay, payCalculation.night_differential_pay,
      payCalculation.holiday_pay, payCalculation.rest_day_pay, payCalculation.total_daily_pay,
      updatedAttendance.manual_overtime_hours, updatedAttendance.notes, payCalculation.is_holiday, payCalculation.holiday_type,
      attendanceId
    );
    
    res.json({ 
      success: true, 
      message: 'Attendance updated successfully',
      calculation: payCalculation
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const attendanceId = req.params.id;
    
    // Check if attendance exists
    const checkStmt = db.prepare('SELECT id FROM attendance WHERE id = ?');
    const existing = checkStmt.get(attendanceId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    // Delete attendance record
    const stmt = db.prepare('DELETE FROM attendance WHERE id = ?');
    stmt.run(attendanceId);
    
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attendance record' });
  }
});

// Get attendance summary for payroll period
router.get('/summary', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { start_date, end_date, employee_id } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: start_date, end_date' 
      });
    }
    
    let query = `
      SELECT 
        a.employee_id,
        e.employee_code, e.full_name, e.employment_type,
        COUNT(*) as days_worked,
        SUM(a.regular_hours) as total_regular_hours,
        SUM(a.overtime_hours) as total_overtime_hours,
        SUM(a.night_differential_hours) as total_night_diff_hours,
        SUM(a.regular_pay) as total_regular_pay,
        SUM(a.overtime_pay) as total_overtime_pay,
        SUM(a.night_differential_pay) as total_night_diff_pay,
        SUM(a.holiday_pay) as total_holiday_pay,
        SUM(a.rest_day_pay) as total_rest_day_pay,
        SUM(a.total_daily_pay) as total_gross_pay
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.work_date BETWEEN ? AND ?
    `;
    
    const params = [start_date, end_date];
    
    if (employee_id) {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }
    
    query += ' GROUP BY a.employee_id, e.employee_code, e.full_name, e.employment_type ORDER BY e.employee_code';
    
    const stmt = db.prepare(query);
    const summary = stmt.all(...params);
    
    // Format currency fields
    const formattedSummary = summary.map(record => ({
      ...record,
      total_regular_pay_formatted: phPayroll.formatCurrency(record.total_regular_pay),
      total_overtime_pay_formatted: phPayroll.formatCurrency(record.total_overtime_pay),
      total_night_diff_pay_formatted: phPayroll.formatCurrency(record.total_night_diff_pay),
      total_holiday_pay_formatted: phPayroll.formatCurrency(record.total_holiday_pay),
      total_rest_day_pay_formatted: phPayroll.formatCurrency(record.total_rest_day_pay),
      total_gross_pay_formatted: phPayroll.formatCurrency(record.total_gross_pay)
    }));
    
    res.json({ success: true, summary: formattedSummary });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance summary' });
  }
});

// Get holidays
router.get('/holidays', (req, res) => {
  try {
    const db = req.app.get('db');
    const { year } = req.query;
    
    let query = 'SELECT * FROM ph_holidays WHERE 1=1';
    const params = [];
    
    if (year) {
      query += ' AND (is_recurring = 1 OR strftime("%Y", holiday_date) = ?)';
      params.push(year);
    }
    
    query += ' ORDER BY holiday_date';
    
    const stmt = db.prepare(query);
    const holidays = stmt.all(...params);
    
    res.json({ success: true, holidays });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch holidays' });
  }
});

module.exports = router;
