const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Get database path from environment or use default
const DB_PATH = process.env.DB_PATH || path.join(process.env.APPDATA || process.env.HOME, 'tgps-payroll', 'payroll_system.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Load schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Prepare common statements
const statements = {
    // Employees
    getAllEmployees: db.prepare('SELECT * FROM employees ORDER BY employee_code'),
    getEmployeeById: db.prepare('SELECT * FROM employees WHERE id = ?'),
    insertEmployee: db.prepare(`
        INSERT INTO employees (
            employee_code, first_name, last_name, middle_name, email,
            phone, address, city, province, postal_code, birth_date,
            gender, civil_status, employment_type, department, position,
            job_title, base_salary, hourly_rate, daily_rate, sss_no,
            philhealth_no, pagibig_no, tin_no, date_hired, status
        ) VALUES (
            @employee_code, @first_name, @last_name, @middle_name, @email,
            @phone, @address, @city, @province, @postal_code, @birth_date,
            @gender, @civil_status, @employment_type, @department, @position,
            @job_title, @base_salary, @hourly_rate, @daily_rate, @sss_no,
            @philhealth_no, @pagibig_no, @tin_no, @date_hired, @status
        ) RETURNING id
    `),
    updateEmployee: db.prepare(`
        UPDATE employees SET
            first_name = @first_name, last_name = @last_name,
            middle_name = @middle_name, email = @email, phone = @phone,
            address = @address, city = @city, province = @province,
            postal_code = @postal_code, birth_date = @birth_date,
            gender = @gender, civil_status = @civil_status,
            employment_type = @employment_type, department = @department,
            position = @position, job_title = @job_title,
            base_salary = @base_salary, hourly_rate = @hourly_rate,
            daily_rate = @daily_rate, sss_no = @sss_no,
            philhealth_no = @philhealth_no, pagibig_no = @pagibig_no,
            tin_no = @tin_no, date_hired = @date_hired, status = @status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    deleteEmployee: db.prepare('UPDATE employees SET status = "Inactive" WHERE id = ?'),

    // Attendance
    insertAttendance: db.prepare(`
        INSERT INTO attendance (
            employee_id, work_date, time_in, time_out,
            break_minutes, day_type, is_holiday, is_rest_day,
            manual_overtime_hours, night_diff_hours, notes,
            photo_in, photo_out
        ) VALUES (
            @employee_id, @work_date, @time_in, @time_out,
            @break_minutes, @day_type, @is_holiday, @is_rest_day,
            @manual_overtime_hours, @night_diff_hours, @notes,
            @photo_in, @photo_out
        ) RETURNING id
    `),
    updateAttendance: db.prepare(`
        UPDATE attendance SET
            time_in = @time_in, time_out = @time_out,
            break_minutes = @break_minutes, day_type = @day_type,
            is_holiday = @is_holiday, is_rest_day = @is_rest_day,
            manual_overtime_hours = @manual_overtime_hours,
            night_diff_hours = @night_diff_hours, notes = @notes,
            photo_in = COALESCE(@photo_in, photo_in),
            photo_out = COALESCE(@photo_out, photo_out),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    getAttendanceByDateRange: db.prepare(`
        SELECT a.*, e.employee_code, e.first_name, e.last_name,
               e.hourly_rate, e.daily_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.work_date BETWEEN ? AND ?
        ORDER BY a.work_date DESC, a.time_in DESC
    `),
    getAttendanceByDate: db.prepare(`
        SELECT a.*, e.employee_code, e.first_name, e.last_name,
               e.hourly_rate, e.daily_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.work_date = ?
        ORDER BY a.time_in DESC
    `),
    getAttendanceByEmployee: db.prepare(`
        SELECT a.*, e.employee_code, e.first_name, e.last_name,
               e.hourly_rate, e.daily_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ?
        ORDER BY a.work_date DESC, a.time_in DESC
    `),
    getAllAttendance: db.prepare(`
        SELECT a.*, e.employee_code, e.first_name, e.last_name,
               e.hourly_rate, e.daily_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        ORDER BY a.work_date DESC, a.time_in DESC
    `),
    getAttendanceById: db.prepare(`
        SELECT a.*, e.employee_code, e.first_name, e.last_name,
               e.hourly_rate, e.daily_rate
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.id = ?
    `),
    deleteAttendance: db.prepare('DELETE FROM attendance WHERE id = ?'),

    // Payroll
    insertPayroll: db.prepare(`
        INSERT INTO payroll (
            employee_id, period_start, period_end, regular_hours,
            overtime_hours, night_diff_hours, basic_pay, overtime_pay,
            night_diff_pay, holiday_pay, sss_contribution,
            philhealth_contribution, pagibig_contribution, bir_tax,
            gross_pay, net_pay
        ) VALUES (
            @employee_id, @period_start, @period_end, @regular_hours,
            @overtime_hours, @night_diff_hours, @basic_pay, @overtime_pay,
            @night_diff_pay, @holiday_pay, @sss_contribution,
            @philhealth_contribution, @pagibig_contribution, @bir_tax,
            @gross_pay, @net_pay
        ) RETURNING id
    `),
    updatePayroll: db.prepare(`
        UPDATE payroll SET
            regular_hours = @regular_hours, overtime_hours = @overtime_hours,
            night_diff_hours = @night_diff_hours, basic_pay = @basic_pay,
            overtime_pay = @overtime_pay, night_diff_pay = @night_diff_pay,
            holiday_pay = @holiday_pay, sss_contribution = @sss_contribution,
            philhealth_contribution = @philhealth_contribution,
            pagibig_contribution = @pagibig_contribution, bir_tax = @bir_tax,
            gross_pay = @gross_pay, net_pay = @net_pay
        WHERE id = @id
    `),
    getPayrollByPeriod: db.prepare(`
        SELECT p.*, e.employee_code, e.first_name, e.last_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.period_start = ? AND p.period_end = ?
        ORDER BY e.employee_code
    `),
    deletePayroll: db.prepare('DELETE FROM payroll WHERE id = ?'),

    // Leave Management
    getLeaveTypes: db.prepare('SELECT * FROM leave_types ORDER BY name'),
    getLeaveBalances: db.prepare(`
        SELECT lb.*, lt.name as leave_type_name
        FROM leave_balances lb
        JOIN leave_types lt ON lb.leave_type = lt.id
        WHERE lb.employee_id = ? AND lb.year = ?
        ORDER BY lt.name
    `),
    insertLeaveBalance: db.prepare(`
        INSERT INTO leave_balances (employee_id, leave_type, year, total_days, used_days, remaining_days)
        VALUES (@employee_id, @leave_type, @year, @total_days, @used_days, @remaining_days)
    `),
    updateLeaveBalance: db.prepare(`
        UPDATE leave_balances SET
            used_days = @used_days, remaining_days = @remaining_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = @employee_id AND leave_type = @leave_type AND year = @year
    `),
    getLeaveRequests: db.prepare(`
        SELECT lr.*, e.employee_code, e.first_name, e.last_name, lt.name as leave_type_name
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type = lt.id
        ORDER BY lr.created_at DESC
    `),
    getLeaveRequestsByEmployee: db.prepare(`
        SELECT lr.*, lt.name as leave_type_name
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type = lt.id
        WHERE lr.employee_id = ?
        ORDER BY lr.created_at DESC
    `),
    insertLeaveRequest: db.prepare(`
        INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days, reason, status)
        VALUES (@employee_id, @leave_type, @start_date, @end_date, @days, @reason, @status)
        RETURNING id
    `),
    updateLeaveRequest: db.prepare(`
        UPDATE leave_requests SET
            status = @status, remarks = @remarks, updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    deleteLeaveRequest: db.prepare('DELETE FROM leave_requests WHERE id = ?'),

    // PH Calculations
    getSSS: db.prepare(`
        SELECT * FROM sss_contributions 
        WHERE ? BETWEEN range_start AND range_end
        AND effective_date <= date('now')
        ORDER BY effective_date DESC LIMIT 1
    `),
    getPhilHealth: db.prepare(`
        SELECT * FROM philhealth_contributions
        WHERE ? BETWEEN range_start AND range_end
        AND effective_date <= date('now')
        ORDER BY effective_date DESC LIMIT 1
    `),
    getPagIBIG: db.prepare(`
        SELECT * FROM pagibig_contributions
        WHERE ? BETWEEN range_start AND range_end
        AND effective_date <= date('now')
        ORDER BY effective_date DESC LIMIT 1
    `),
    getBIRTax: db.prepare(`
        SELECT * FROM bir_tax_brackets
        WHERE ? BETWEEN range_start AND range_end
        AND effective_date <= date('now')
        ORDER BY effective_date DESC LIMIT 1
    `),

    // User authentication
    getUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?')
};

module.exports = {
    db,
    ...statements
};
