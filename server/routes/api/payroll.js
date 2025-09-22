const express = require('express');
const router = express.Router();
const db = require('../../db');
const PayrollCalculator = require('../../services/ph_calculations');
const { payrollValidation } = require('../../services/validation');
const { ValidationError } = require('../../services/validation');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Calculate payroll
router.post('/calculate', asyncHandler(async (req, res) => {
    try {
        const { start_date, end_date, employee_ids } = req.body;

        // Validate period
        payrollValidation.period(start_date, end_date);

        // Get employees
        let employees;
        if (employee_ids?.length > 0) {
            employees = employee_ids.map(id => db.getEmployeeById.get(id));
        } else {
            employees = db.getAllActiveEmployees.all();
        }

        // Get attendance records
        const attendance = db.getAttendanceByDateRange.all(start_date, end_date);

        // Calculate period days
        const period = {
            days: Math.ceil(
                (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
            ) + 1
        };

        // Calculate payroll for each employee
        const payroll_data = employees.map(employee => {
            // Get employee's attendance
            const employeeAttendance = attendance.filter(a => 
                a.employee_id === employee.id
            );

            // Calculate payroll
            const calculations = PayrollCalculator.calculatePayroll(
                employee,
                employeeAttendance,
                period
            );

            // Save payroll record
            const result = db.insertPayroll.run({
                employee_id: employee.id,
                period_start: start_date,
                period_end: end_date,
                ...calculations
            });

            return {
                employee_id: employee.id,
                employee_code: employee.employee_code,
                first_name: employee.first_name,
                last_name: employee.last_name,
                ...calculations
            };
        });

        res.json({ payroll_data });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ 
                error: err.message,
                field: err.field 
            });
        }
        throw err;
    }
}));

// Export payroll to CSV
router.post('/export', asyncHandler(async (req, res) => {
    const { start_date, end_date, format = 'csv' } = req.body;

    // Validate period
    payrollValidation.period(start_date, end_date);

    // Get payroll records
    const records = db.getPayrollByPeriod.all(start_date, end_date);

    if (format === 'csv') {
        // Generate CSV
        const fields = [
            'Employee Code',
            'Name',
            'Regular Hours',
            'OT Hours',
            'Night Diff Hours',
            'Basic Pay',
            'OT Pay',
            'Night Diff Pay',
            'Holiday Pay',
            'Gross Pay',
            'SSS',
            'PhilHealth',
            'Pag-IBIG',
            'Tax',
            'Total Deductions',
            'Net Pay'
        ];

        const csv = [
            fields.join(','),
            ...records.map(r => [
                r.employee_code,
                `${r.first_name} ${r.last_name}`,
                r.regular_hours,
                r.overtime_hours,
                r.night_diff_hours,
                r.basic_pay,
                r.overtime_pay,
                r.night_diff_pay,
                r.holiday_pay,
                r.gross_pay,
                r.sss_contribution,
                r.philhealth_contribution,
                r.pagibig_contribution,
                r.bir_tax,
                r.total_deductions,
                r.net_pay
            ].join(','))
        ].join('\n');

        res.json({ csv_data: csv });
    } else {
        throw new Error('Unsupported export format');
    }
}));

// Get payroll history
router.get('/history', asyncHandler(async (req, res) => {
    const { start_date, end_date, employee_id } = req.query;

    let records;
    if (employee_id) {
        records = db.getPayrollHistoryByEmployee.all(
            employee_id,
            start_date || '1900-01-01',
            end_date || '9999-12-31'
        );
    } else {
        records = db.getPayrollHistory.all(
            start_date || '1900-01-01',
            end_date || '9999-12-31'
        );
    }

    res.json({ payroll_history: records });
}));

// Error handler
router.use((err, req, res, next) => {
    console.error('Payroll API Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

module.exports = router;
