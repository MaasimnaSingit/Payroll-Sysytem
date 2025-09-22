// Philippines-compliant Payroll Management API
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const phPayroll = require('../lib/ph_payroll');

// Calculate payroll for period with PH deductions
router.post('/calculate', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { start_date, end_date, employee_ids } = req.body;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: start_date, end_date' 
      });
    }
    
    // Get attendance summary for the period
    let query = `
      SELECT 
        a.employee_id,
        e.employee_code, e.first_name, e.last_name, e.employment_type,
        e.base_salary, e.daily_rate, e.hourly_rate,
        e.sss_no, e.philhealth_no, e.pagibig_no, e.tin_no,
        COUNT(*) as days_worked,
        SUM(CASE 
          WHEN a.time_out IS NOT NULL THEN 
            CASE 
              WHEN a.is_holiday = 1 THEN 0
              WHEN a.is_rest_day = 1 THEN 0
              ELSE GREATEST(0, (strftime('%s', a.time_out) - strftime('%s', a.time_in)) / 3600.0 - COALESCE(a.break_minutes, 0) / 60.0)
            END
          ELSE 0 
        END) as total_regular_hours,
        SUM(COALESCE(a.manual_overtime_hours, 0)) as total_overtime_hours,
        SUM(COALESCE(a.night_diff_hours, 0)) as total_night_diff_hours
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.work_date BETWEEN ? AND ?
    `;
    
    const params = [start_date, end_date];
    
    if (employee_ids && employee_ids.length > 0) {
      const placeholders = employee_ids.map(() => '?').join(',');
      query += ` AND a.employee_id IN (${placeholders})`;
      params.push(...employee_ids);
    }
    
    query += ' GROUP BY a.employee_id, e.employee_code, e.first_name, e.last_name, e.employment_type ORDER BY e.employee_code';
    
    const stmt = db.prepare(query);
    const attendanceData = stmt.all(...params);
    
    // Calculate payroll for each employee
    const payrollData = attendanceData.map(record => {
      // Calculate basic pay (regular hours * hourly rate)
      const basicPay = record.total_regular_hours * record.hourly_rate;
      
      // Calculate overtime pay (overtime hours * hourly rate * 1.25)
      const overtimePay = record.total_overtime_hours * record.hourly_rate * 1.25;
      
      // Calculate night differential pay (night diff hours * hourly rate * 0.10)
      const nightDiffPay = record.total_night_diff_hours * record.hourly_rate * 0.10;
      
      // Calculate gross salary
      const grossSalary = basicPay + overtimePay + nightDiffPay;
      
      // Calculate deductions
      const deductions = phPayroll.calculateDeductions(record, grossSalary);
      
      return {
        employee_id: record.employee_id,
        employee_code: record.employee_code,
        full_name: `${record.first_name} ${record.last_name}`,
        employment_type: record.employment_type,
        days_worked: record.days_worked,
        total_regular_hours: record.total_regular_hours,
        total_overtime_hours: record.total_overtime_hours,
        total_night_diff_hours: record.total_night_diff_hours,
        basic_pay: basicPay,
        overtime_pay: overtimePay,
        night_diff_pay: nightDiffPay,
        gross_salary: grossSalary,
        gross_salary_formatted: phPayroll.formatCurrency(grossSalary),
        deductions: {
          sss_employee: deductions.sss_employee,
          sss_employer: deductions.sss_employer,
          philhealth: deductions.philhealth,
          pagibig_employee: deductions.pagibig_employee,
          pagibig_employer: deductions.pagibig_employer,
          bir_tax: deductions.bir_tax,
          total_deductions: deductions.total_deductions,
          total_deductions_formatted: phPayroll.formatCurrency(deductions.total_deductions)
        },
        net_salary: deductions.net_salary,
        net_salary_formatted: phPayroll.formatCurrency(deductions.net_salary),
        government_ids: {
          sss_number: record.sss_no,
          philhealth_number: record.philhealth_no,
          pagibig_number: record.pagibig_no,
          tin_number: record.tin_no
        }
      };
    });
    
    // Calculate totals
    const totals = {
      total_employees: payrollData.length,
      total_gross_salary: payrollData.reduce((sum, emp) => sum + emp.gross_salary, 0),
      total_deductions: payrollData.reduce((sum, emp) => sum + emp.deductions.total_deductions, 0),
      total_net_salary: payrollData.reduce((sum, emp) => sum + emp.net_salary, 0),
      total_sss_employee: payrollData.reduce((sum, emp) => sum + emp.deductions.sss_employee, 0),
      total_sss_employer: payrollData.reduce((sum, emp) => sum + emp.deductions.sss_employer, 0),
      total_philhealth: payrollData.reduce((sum, emp) => sum + emp.deductions.philhealth, 0),
      total_pagibig_employee: payrollData.reduce((sum, emp) => sum + emp.deductions.pagibig_employee, 0),
      total_pagibig_employer: payrollData.reduce((sum, emp) => sum + emp.deductions.pagibig_employer, 0),
      total_bir_tax: payrollData.reduce((sum, emp) => sum + emp.deductions.bir_tax, 0)
    };
    
    // Format totals
    totals.total_gross_salary_formatted = phPayroll.formatCurrency(totals.total_gross_salary);
    totals.total_deductions_formatted = phPayroll.formatCurrency(totals.total_deductions);
    totals.total_net_salary_formatted = phPayroll.formatCurrency(totals.total_net_salary);
    totals.total_sss_employee_formatted = phPayroll.formatCurrency(totals.total_sss_employee);
    totals.total_sss_employer_formatted = phPayroll.formatCurrency(totals.total_sss_employer);
    totals.total_philhealth_formatted = phPayroll.formatCurrency(totals.total_philhealth);
    totals.total_pagibig_employee_formatted = phPayroll.formatCurrency(totals.total_pagibig_employee);
    totals.total_pagibig_employer_formatted = phPayroll.formatCurrency(totals.total_pagibig_employer);
    totals.total_bir_tax_formatted = phPayroll.formatCurrency(totals.total_bir_tax);
    
    res.json({ 
      success: true, 
      payroll_data: payrollData,
      totals,
      period: {
        start_date: phPayroll.formatDate(start_date),
        end_date: phPayroll.formatDate(end_date)
      }
    });
  } catch (error) {
    console.error('Error calculating payroll:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate payroll' });
  }
});

// Get payroll history
router.get('/history', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { start_date, end_date, employee_id } = req.query;
    
    let query = `
      SELECT 
        p.*,
        e.employee_code, e.full_name
      FROM payroll_runs p
      JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (start_date) {
      query += ' AND p.period_start >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND p.period_end <= ?';
      params.push(end_date);
    }
    
    if (employee_id) {
      query += ' AND p.employee_id = ?';
      params.push(employee_id);
    }
    
    query += ' ORDER BY p.period_start DESC, e.employee_code';
    
    const stmt = db.prepare(query);
    const history = stmt.all(...params);
    
    // Format currency fields
    const formattedHistory = history.map(record => ({
      ...record,
      gross_salary_formatted: phPayroll.formatCurrency(record.gross_salary),
      total_deductions_formatted: phPayroll.formatCurrency(record.total_deductions),
      net_salary_formatted: phPayroll.formatCurrency(record.net_salary),
      period_start_formatted: phPayroll.formatDate(record.period_start),
      period_end_formatted: phPayroll.formatDate(record.period_end)
    }));
    
    res.json({ success: true, history: formattedHistory });
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payroll history' });
  }
});

// Save payroll run
router.post('/save', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { period_start, period_end, payroll_data } = req.body;
    
    if (!period_start || !period_end || !payroll_data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: period_start, period_end, payroll_data' 
      });
    }
    
    // Create payroll run record
    const runStmt = db.prepare(`
      INSERT INTO payroll_runs (period_start, period_end, created_at, created_by)
      VALUES (?, ?, datetime('now'), ?)
    `);
    
    const runResult = runStmt.run(period_start, period_end, req.user.id);
    const payrollRunId = runResult.lastInsertRowid;
    
    // Save individual payroll records
    const payrollStmt = db.prepare(`
      INSERT INTO payroll_records (
        payroll_run_id, employee_id, gross_salary, sss_employee, sss_employer,
        philhealth, pagibig_employee, pagibig_employer, bir_tax, total_deductions, net_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const payrollRecords = [];
    
    for (const employee of payroll_data) {
      const result = payrollStmt.run(
        payrollRunId,
        employee.employee_id,
        employee.gross_salary,
        employee.deductions.sss_employee,
        employee.deductions.sss_employer,
        employee.deductions.philhealth,
        employee.deductions.pagibig_employee,
        employee.deductions.pagibig_employer,
        employee.deductions.bir_tax,
        employee.deductions.total_deductions,
        employee.net_salary
      );
      
      payrollRecords.push({
        id: result.lastInsertRowid,
        employee_id: employee.employee_id,
        employee_code: employee.employee_code,
        full_name: employee.full_name
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Payroll saved successfully',
      payroll_run_id: payrollRunId,
      records_count: payrollRecords.length,
      records: payrollRecords
    });
  } catch (error) {
    console.error('Error saving payroll:', error);
    res.status(500).json({ success: false, error: 'Failed to save payroll' });
  }
});

// Generate payslip
router.get('/payslip/:employee_id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { employee_id } = req.params;
    const { period_start, period_end } = req.query;
    
    if (!period_start || !period_end) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: period_start, period_end' 
      });
    }
    
    // Get employee data
    const empStmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    const employee = empStmt.get(employee_id);
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Get attendance data for period
    const attStmt = db.prepare(`
      SELECT 
        work_date, day_type, time_in, time_out, break_minutes,
        regular_hours, overtime_hours, night_differential_hours,
        regular_pay, overtime_pay, night_differential_pay, holiday_pay, rest_day_pay, total_daily_pay
      FROM attendance 
      WHERE employee_id = ? AND work_date BETWEEN ? AND ?
      ORDER BY work_date
    `);
    
    const attendance = attStmt.all(employee_id, period_start, period_end);
    
    // Calculate totals
    const totals = {
      days_worked: attendance.length,
      total_regular_hours: attendance.reduce((sum, day) => sum + day.regular_hours, 0),
      total_overtime_hours: attendance.reduce((sum, day) => sum + day.overtime_hours, 0),
      total_night_diff_hours: attendance.reduce((sum, day) => sum + day.night_differential_hours, 0),
      total_regular_pay: attendance.reduce((sum, day) => sum + day.regular_pay, 0),
      total_overtime_pay: attendance.reduce((sum, day) => sum + day.overtime_pay, 0),
      total_night_diff_pay: attendance.reduce((sum, day) => sum + day.night_differential_pay, 0),
      total_holiday_pay: attendance.reduce((sum, day) => sum + day.holiday_pay, 0),
      total_rest_day_pay: attendance.reduce((sum, day) => sum + day.rest_day_pay, 0),
      total_gross_pay: attendance.reduce((sum, day) => sum + day.total_daily_pay, 0)
    };
    
    // Calculate deductions
    const deductions = phPayroll.calculateDeductions(employee, totals.total_gross_pay);
    
    // Format payslip data
    const payslip = {
      employee: {
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        department: employee.department,
        position: employee.position,
        employment_type: employee.employment_type
      },
      period: {
        start_date: phPayroll.formatDate(period_start),
        end_date: phPayroll.formatDate(period_end),
        start_date_raw: period_start,
        end_date_raw: period_end
      },
      attendance: attendance.map(day => ({
        ...day,
        work_date_formatted: phPayroll.formatDate(day.work_date),
        regular_pay_formatted: phPayroll.formatCurrency(day.regular_pay),
        overtime_pay_formatted: phPayroll.formatCurrency(day.overtime_pay),
        night_differential_pay_formatted: phPayroll.formatCurrency(day.night_differential_pay),
        holiday_pay_formatted: phPayroll.formatCurrency(day.holiday_pay),
        rest_day_pay_formatted: phPayroll.formatCurrency(day.rest_day_pay),
        total_daily_pay_formatted: phPayroll.formatCurrency(day.total_daily_pay)
      })),
      earnings: {
        regular_pay: totals.total_regular_pay,
        regular_pay_formatted: phPayroll.formatCurrency(totals.total_regular_pay),
        overtime_pay: totals.total_overtime_pay,
        overtime_pay_formatted: phPayroll.formatCurrency(totals.total_overtime_pay),
        night_differential_pay: totals.total_night_diff_pay,
        night_differential_pay_formatted: phPayroll.formatCurrency(totals.total_night_diff_pay),
        holiday_pay: totals.total_holiday_pay,
        holiday_pay_formatted: phPayroll.formatCurrency(totals.total_holiday_pay),
        rest_day_pay: totals.total_rest_day_pay,
        rest_day_pay_formatted: phPayroll.formatCurrency(totals.total_rest_day_pay),
        total_gross_pay: totals.total_gross_pay,
        total_gross_pay_formatted: phPayroll.formatCurrency(totals.total_gross_pay)
      },
      deductions: {
        sss_employee: deductions.sss_employee,
        sss_employee_formatted: phPayroll.formatCurrency(deductions.sss_employee),
        philhealth: deductions.philhealth,
        philhealth_formatted: phPayroll.formatCurrency(deductions.philhealth),
        pagibig_employee: deductions.pagibig_employee,
        pagibig_employee_formatted: phPayroll.formatCurrency(deductions.pagibig_employee),
        bir_tax: deductions.bir_tax,
        bir_tax_formatted: phPayroll.formatCurrency(deductions.bir_tax),
        total_deductions: deductions.total_deductions,
        total_deductions_formatted: phPayroll.formatCurrency(deductions.total_deductions)
      },
      net_pay: {
        amount: deductions.net_salary,
        amount_formatted: phPayroll.formatCurrency(deductions.net_salary)
      },
      summary: {
        days_worked: totals.days_worked,
        total_regular_hours: totals.total_regular_hours,
        total_overtime_hours: totals.total_overtime_hours,
        total_night_diff_hours: totals.total_night_diff_hours
      }
    };
    
    res.json({ success: true, payslip });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ success: false, error: 'Failed to generate payslip' });
  }
});

// Export payroll to CSV
router.get('/export', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: start_date, end_date' 
      });
    }
    
    // Get payroll data
    const query = `
      SELECT 
        a.employee_id,
        e.employee_code, e.full_name, e.employment_type,
        e.sss_number, e.philhealth_number, e.pagibig_number, e.tin_number,
        COUNT(*) as days_worked,
        SUM(a.regular_hours) as total_regular_hours,
        SUM(a.overtime_hours) as total_overtime_hours,
        SUM(a.night_differential_hours) as total_night_diff_hours,
        SUM(a.total_daily_pay) as total_gross_pay
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.work_date BETWEEN ? AND ?
      GROUP BY a.employee_id, e.employee_code, e.full_name, e.employment_type
      ORDER BY e.employee_code
    `;
    
    const stmt = db.prepare(query);
    const payrollData = stmt.all(start_date, end_date);
    
    // Calculate deductions for each employee
    const csvData = payrollData.map(record => {
      const deductions = phPayroll.calculateDeductions(record, record.total_gross_pay);
      
      return {
        'Employee Code': record.employee_code,
        'Full Name': record.full_name,
        'Employment Type': record.employment_type,
        'Days Worked': record.days_worked,
        'Regular Hours': record.total_regular_hours,
        'Overtime Hours': record.total_overtime_hours,
        'Night Diff Hours': record.total_night_diff_hours,
        'Gross Salary': record.total_gross_pay,
        'SSS Employee': deductions.sss_employee,
        'SSS Employer': deductions.sss_employer,
        'PhilHealth': deductions.philhealth,
        'Pag-IBIG Employee': deductions.pagibig_employee,
        'Pag-IBIG Employer': deductions.pagibig_employer,
        'BIR Tax': deductions.bir_tax,
        'Total Deductions': deductions.total_deductions,
        'Net Salary': deductions.net_salary,
        'SSS Number': record.sss_number,
        'PhilHealth Number': record.philhealth_number,
        'Pag-IBIG Number': record.pagibig_number,
        'TIN Number': record.tin_number
      };
    });
    
    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payroll_${start_date}_to_${end_date}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting payroll:', error);
    res.status(500).json({ success: false, error: 'Failed to export payroll' });
  }
});

module.exports = router;
