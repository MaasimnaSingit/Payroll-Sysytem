const express = require('express');
const router = express.Router();
const db = require('../db');
const { calculatePayroll } = require('../utils/ph_calculations');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Employee endpoints
router.get('/employees', asyncHandler(async (req, res) => {
    const employees = db.getAllEmployees.all();
    res.json({ employees });
}));

router.post('/employees', asyncHandler(async (req, res) => {
    const result = db.insertEmployee.run(req.body);
    res.json({ id: result.lastID });
}));

router.put('/employees/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    db.updateEmployee.run({ ...req.body, id });
    res.json({ success: true });
}));

// Attendance endpoints
router.post('/attendance', asyncHandler(async (req, res) => {
    // Convert base64 photos to Buffer
    const photoIn = req.body.photo_in ? Buffer.from(
        req.body.photo_in.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    ) : null;
    
    const photoOut = req.body.photo_out ? Buffer.from(
        req.body.photo_out.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
    ) : null;

    const result = db.insertAttendance.run({
        ...req.body,
        photo_in: photoIn,
        photo_out: photoOut
    });

    res.json({ id: result.lastID });
}));

router.get('/attendance', asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;
    const records = db.getAttendanceByDateRange.all(start_date, end_date);

    // Convert photos back to base64
    const recordsWithPhotos = records.map(record => ({
        ...record,
        photo_in: record.photo_in ? 
            `data:image/jpeg;base64,${record.photo_in.toString('base64')}` : null,
        photo_out: record.photo_out ? 
            `data:image/jpeg;base64,${record.photo_out.toString('base64')}` : null
    }));

    res.json({ records: recordsWithPhotos });
}));

// Payroll endpoints
router.post('/payroll/calculate', asyncHandler(async (req, res) => {
    const { start_date, end_date, employee_ids } = req.body;

    // Get employees
    let employees = employee_ids?.length > 0 
        ? employee_ids.map(id => db.getEmployeeById.get(id))
        : db.getAllEmployees.all();

    // Filter out inactive employees
    employees = employees.filter(e => e && e.status === 'Active');

    // Get attendance records
    const attendance = db.getAttendanceByDateRange.all(start_date, end_date);

    // Calculate payroll for each employee
    const payroll_data = employees.map(employee => {
        const employeeAttendance = attendance.filter(a => 
            a.employee_id === employee.id
        );

        const calculations = calculatePayroll(employee, employeeAttendance);

        return {
            employee_id: employee.id,
            employee_code: employee.employee_code,
            first_name: employee.first_name,
            last_name: employee.last_name,
            ...calculations
        };
    });

    res.json({ payroll_data });
}));

// Test data endpoint
router.post('/test-data', asyncHandler(async (req, res) => {
    // Insert test employee
    const empResult = db.insertEmployee.run({
        employee_code: 'TEST001',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan@test.com',
        employment_type: 'Regular',
        base_salary: 25000,
        hourly_rate: 150,
        daily_rate: 1200,
        sss_no: '11-2233445-6',
        philhealth_no: '12-345678901-2',
        pagibig_no: '1234-5678-9012',
        tin_no: '123-456-789-000',
        date_hired: '2024-01-01',
        status: 'Active'
    });

    // Insert test attendance
    const today = new Date().toISOString().slice(0, 10);
    db.insertAttendance.run({
        employee_id: empResult.lastID,
        work_date: today,
        time_in: '08:00',
        time_out: '17:00',
        break_minutes: 60,
        day_type: 'Regular',
        ot_override: 2,
        notes: 'Test attendance'
    });

    res.json({ 
        success: true,
        message: 'Test data inserted successfully',
        employee_id: empResult.lastID
    });
}));

// Error handler
router.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: err.message || 'Internal server error'
    });
});

module.exports = router;
