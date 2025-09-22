// Philippines-compliant Employee Management API
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const phPayroll = require('../lib/ph_payroll');

// Get all employees with PH-specific fields
router.get('/', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const stmt = db.prepare(`
      SELECT 
        id, employee_code, first_name, last_name, middle_name,
        email, phone, address, city, province, postal_code,
        birth_date, gender, civil_status,
        employment_type, department, position, job_title,
        date_hired, base_salary, daily_rate, hourly_rate,
        sss_no, philhealth_no, pagibig_no, tin_no,
        status, created_at, updated_at
      FROM employees 
      ORDER BY employee_code
    `);
    const employees = stmt.all();
    
    // Format currency fields
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      basic_salary_formatted: phPayroll.formatCurrency(emp.base_salary),
      daily_rate_formatted: phPayroll.formatCurrency(emp.daily_rate),
      hourly_rate_formatted: phPayroll.formatCurrency(emp.hourly_rate),
      hire_date_formatted: phPayroll.formatDate(emp.date_hired),
      birth_date_formatted: emp.birth_date ? phPayroll.formatDate(emp.birth_date) : null
    }));
    
    res.json({ success: true, employees: formattedEmployees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const stmt = db.prepare(`
      SELECT 
        id, employee_code, first_name, last_name, middle_name,
        email, phone, address, city, province, postal_code,
        birth_date, gender, civil_status,
        employment_type, department, position, job_title,
        date_hired, base_salary, daily_rate, hourly_rate,
        sss_no, philhealth_no, pagibig_no, tin_no,
        status, created_at, updated_at
      FROM employees 
      WHERE id = ?
    `);
    const employee = stmt.get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Format currency fields
    const formattedEmployee = {
      ...employee,
      basic_salary_formatted: phPayroll.formatCurrency(employee.base_salary),
      daily_rate_formatted: phPayroll.formatCurrency(employee.daily_rate),
      hourly_rate_formatted: phPayroll.formatCurrency(employee.hourly_rate),
      hire_date_formatted: phPayroll.formatDate(employee.date_hired),
      birth_date_formatted: employee.birth_date ? phPayroll.formatDate(employee.birth_date) : null
    };
    
    res.json({ success: true, employee: formattedEmployee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      employee_code, first_name, last_name, middle_name, email, phone, address, city, province, postal_code,
      birth_date, gender, civil_status, employment_type, department, position, job_title,
      date_hired, base_salary, daily_rate, hourly_rate,
      sss_no, philhealth_no, pagibig_no, tin_no, status
    } = req.body;
    
    // Validate required fields
    if (!employee_code || !first_name || !last_name || !email || !employment_type || !date_hired) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: employee_code, first_name, last_name, email, employment_type, date_hired' 
      });
    }
    
    // Check if employee code already exists
    const checkStmt = db.prepare('SELECT id FROM employees WHERE employee_code = ?');
    const existing = checkStmt.get(employee_code);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Employee code already exists' });
    }
    
    // Check if email already exists
    const emailStmt = db.prepare('SELECT id FROM employees WHERE email = ?');
    const existingEmail = emailStmt.get(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    
    // Calculate rates if not provided
    let calculatedDailyRate = daily_rate;
    let calculatedHourlyRate = hourly_rate;
    
    if (base_salary && !daily_rate) {
      calculatedDailyRate = base_salary / 22; // 22 working days per month
    }
    if (calculatedDailyRate && !hourly_rate) {
      calculatedHourlyRate = calculatedDailyRate / 8; // 8 hours per day
    }
    
    // If base_salary is provided but rates are not, calculate them
    if (base_salary && !daily_rate && !hourly_rate) {
      calculatedDailyRate = base_salary / 22;
      calculatedHourlyRate = calculatedDailyRate / 8;
    }
    
    const stmt = db.prepare(`
      INSERT INTO employees (
        employee_code, first_name, last_name, middle_name, email, phone, address, city, province, postal_code,
        birth_date, gender, civil_status, employment_type, department, position, job_title,
        base_salary, hourly_rate, daily_rate, sss_no, philhealth_no, pagibig_no, tin_no,
        date_hired, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    console.log('Inserting employee with values:', {
      employee_code, first_name, last_name, middle_name, email, phone, address, city, province, postal_code,
      birth_date, gender, civil_status, employment_type, department, position, job_title,
      base_salary: base_salary || 0, calculatedHourlyRate: calculatedHourlyRate || 0, calculatedDailyRate: calculatedDailyRate || 0, sss_no, philhealth_no, pagibig_no, tin_no,
      date_hired, status: status || 'Active'
    });
    
    const result = stmt.run(
      employee_code, first_name, last_name, middle_name, email, phone, address, city, province, postal_code,
      birth_date, gender, civil_status, employment_type, department, position, job_title,
      base_salary || 0, calculatedHourlyRate || 0, calculatedDailyRate || 0, sss_no, philhealth_no, pagibig_no, tin_no,
      date_hired, status || 'Active'
    );
    
    res.json({ 
      success: true, 
      message: 'Employee created successfully',
      employee_id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create employee',
      details: error.message 
    });
  }
});

// Update employee
router.put('/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const employeeId = req.params.id;
    const updateData = req.body;
    
    // Check if employee exists
    const checkStmt = db.prepare('SELECT id FROM employees WHERE id = ?');
    const existing = checkStmt.get(employeeId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Recalculate rates if base_salary is updated
    if (updateData.base_salary !== undefined) {
      if (!updateData.daily_rate) {
        updateData.daily_rate = updateData.base_salary / 22; // 22 working days per month
      }
      if (!updateData.hourly_rate) {
        updateData.hourly_rate = updateData.daily_rate / 8; // 8 hours per day
      }
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }
    
    fields.push('updated_at = datetime("now")');
    values.push(employeeId);
    
    const stmt = db.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const employeeId = req.params.id;
    
    // Check if employee exists
    const checkStmt = db.prepare('SELECT id FROM employees WHERE id = ?');
    const existing = checkStmt.get(employeeId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Soft delete - set status to Inactive
    const stmt = db.prepare('UPDATE employees SET status = "Inactive", updated_at = datetime("now") WHERE id = ?');
    stmt.run(employeeId);
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
});

// Get employment types (PH-specific)
router.get('/employment-types', (req, res) => {
  const employmentTypes = [
    { value: 'Regular', label: 'Regular (Monthly Salary)', description: 'Permanent employee with monthly salary' },
    { value: 'Probationary', label: 'Probationary (6 months)', description: 'Probationary employee, 6-month period' },
    { value: 'Contractual', label: 'Contractual (Fixed Term)', description: 'Fixed-term contract employee' },
    { value: 'Part-time', label: 'Part-time (Hourly)', description: 'Part-time employee paid by hour' },
    { value: 'Daily', label: 'Daily (Kasambahay, Construction)', description: 'Daily wage earner' }
  ];
  
  res.json({ success: true, employment_types: employmentTypes });
});

// Get departments
router.get('/departments', (req, res) => {
  try {
    const db = req.app.get('db');
    const stmt = db.prepare('SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department');
    const departments = stmt.all().map(row => row.department);
    
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
});

module.exports = router;
