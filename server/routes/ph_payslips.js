// Philippines-compliant Payslip Generation API
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const phPayroll = require('../lib/ph_payroll');
const PDFDocument = require('pdfkit');

// Generate PDF payslip
router.get('/pdf/:employee_id', authRequired, requireRole('admin'), (req, res) => {
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
    
    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip_${employee.employee_code}_${period_start}_to_${period_end}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Company header
    doc.fontSize(20).font('Helvetica-Bold').text('PAYSLIP', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Philippines Labor Law Compliant', { align: 'center' });
    doc.moveDown();
    
    // Employee information
    doc.fontSize(14).font('Helvetica-Bold').text('Employee Information');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Employee Code: ${employee.employee_code}`);
    doc.text(`Name: ${employee.full_name}`);
    doc.text(`Department: ${employee.department || 'N/A'}`);
    doc.text(`Position: ${employee.position || 'N/A'}`);
    doc.text(`Employment Type: ${employee.employment_type}`);
    doc.moveDown();
    
    // Pay period
    doc.fontSize(14).font('Helvetica-Bold').text('Pay Period');
    doc.fontSize(10).font('Helvetica');
    doc.text(`From: ${phPayroll.formatDate(period_start)}`);
    doc.text(`To: ${phPayroll.formatDate(period_end)}`);
    doc.moveDown();
    
    // Attendance summary
    doc.fontSize(14).font('Helvetica-Bold').text('Attendance Summary');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Days Worked: ${totals.days_worked}`);
    doc.text(`Regular Hours: ${totals.total_regular_hours.toFixed(2)}`);
    doc.text(`Overtime Hours: ${totals.total_overtime_hours.toFixed(2)}`);
    doc.text(`Night Differential Hours: ${totals.total_night_diff_hours.toFixed(2)}`);
    doc.moveDown();
    
    // Earnings breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Earnings');
    doc.fontSize(10).font('Helvetica');
    
    const earningsTable = [
      ['Description', 'Hours', 'Rate', 'Amount'],
      ['Regular Pay', totals.total_regular_hours.toFixed(2), '₱' + (employee.hourly_rate || 0).toFixed(2), phPayroll.formatCurrency(totals.total_regular_pay)],
      ['Overtime Pay', totals.total_overtime_hours.toFixed(2), '₱' + (employee.overtime_rate || 0).toFixed(2), phPayroll.formatCurrency(totals.total_overtime_pay)],
      ['Night Differential', totals.total_night_diff_hours.toFixed(2), '₱' + ((employee.hourly_rate || 0) * 0.10).toFixed(2), phPayroll.formatCurrency(totals.total_night_diff_pay)],
      ['Holiday Pay', '', '', phPayroll.formatCurrency(totals.total_holiday_pay)],
      ['Rest Day Pay', '', '', phPayroll.formatCurrency(totals.total_rest_day_pay)],
      ['', '', 'TOTAL GROSS:', phPayroll.formatCurrency(totals.total_gross_pay)]
    ];
    
    // Draw earnings table
    let tableTop = doc.y;
    const colWidths = [150, 60, 80, 100];
    const rowHeight = 20;
    
    earningsTable.forEach((row, index) => {
      let x = 50;
      row.forEach((cell, colIndex) => {
        doc.text(cell, x, tableTop + (index * rowHeight), { width: colWidths[colIndex] });
        x += colWidths[colIndex];
      });
    });
    
    doc.moveDown(earningsTable.length + 1);
    
    // Deductions breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Deductions');
    doc.fontSize(10).font('Helvetica');
    
    const deductionsTable = [
      ['Description', 'Amount'],
      ['SSS Employee', phPayroll.formatCurrency(deductions.sss_employee)],
      ['PhilHealth', phPayroll.formatCurrency(deductions.philhealth)],
      ['Pag-IBIG Employee', phPayroll.formatCurrency(deductions.pagibig_employee)],
      ['BIR Tax Withholding', phPayroll.formatCurrency(deductions.bir_tax)],
      ['', ''],
      ['TOTAL DEDUCTIONS:', phPayroll.formatCurrency(deductions.total_deductions)]
    ];
    
    // Draw deductions table
    tableTop = doc.y;
    const dedColWidths = [200, 100];
    
    deductionsTable.forEach((row, index) => {
      let x = 50;
      row.forEach((cell, colIndex) => {
        doc.text(cell, x, tableTop + (index * rowHeight), { width: dedColWidths[colIndex] });
        x += dedColWidths[colIndex];
      });
    });
    
    doc.moveDown(deductionsTable.length + 1);
    
    // Net pay
    doc.fontSize(16).font('Helvetica-Bold').text(`NET PAY: ${phPayroll.formatCurrency(deductions.net_salary)}`, { align: 'center' });
    doc.moveDown();
    
    // Government IDs
    doc.fontSize(12).font('Helvetica-Bold').text('Government IDs');
    doc.fontSize(10).font('Helvetica');
    doc.text(`SSS: ${employee.sss_number || 'N/A'}`);
    doc.text(`PhilHealth: ${employee.philhealth_number || 'N/A'}`);
    doc.text(`Pag-IBIG: ${employee.pagibig_number || 'N/A'}`);
    doc.text(`TIN: ${employee.tin_number || 'N/A'}`);
    doc.moveDown();
    
    // Footer
    doc.fontSize(8).font('Helvetica').text('This payslip is generated in compliance with Philippine Labor Laws', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-PH')}`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF payslip:', error);
    res.status(500).json({ success: false, error: 'Failed to generate payslip PDF' });
  }
});

// Generate payslip data for frontend
router.get('/data/:employee_id', authRequired, requireRole('admin'), (req, res) => {
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
        employment_type: employee.employment_type,
        sss_number: employee.sss_number,
        philhealth_number: employee.philhealth_number,
        pagibig_number: employee.pagibig_number,
        tin_number: employee.tin_number
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
        sss_employer: deductions.sss_employer,
        sss_employer_formatted: phPayroll.formatCurrency(deductions.sss_employer),
        philhealth: deductions.philhealth,
        philhealth_formatted: phPayroll.formatCurrency(deductions.philhealth),
        pagibig_employee: deductions.pagibig_employee,
        pagibig_employee_formatted: phPayroll.formatCurrency(deductions.pagibig_employee),
        pagibig_employer: deductions.pagibig_employer,
        pagibig_employer_formatted: phPayroll.formatCurrency(deductions.pagibig_employer),
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
    console.error('Error generating payslip data:', error);
    res.status(500).json({ success: false, error: 'Failed to generate payslip data' });
  }
});

module.exports = router;
