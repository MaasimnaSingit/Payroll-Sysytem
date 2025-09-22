import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize database
const dbPath = path.join(process.env.APPDATA || process.env.HOME, 'tgps-payroll', 'payroll_system.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Load schema
const schema = fs.readFileSync(path.join(__dirname, '../../server/db/schema.sql'), 'utf8');
db.exec(schema);

// Prepare statements
const statements = {
    // Employee statements
    getAllEmployees: db.prepare('SELECT * FROM employees ORDER BY last_name, first_name'),
    getEmployeeById: db.prepare('SELECT * FROM employees WHERE id = ?'),
    getEmployeeByCode: db.prepare('SELECT * FROM employees WHERE employee_code = ?'),
    insertEmployee: db.prepare(`
        INSERT INTO employees (
            employee_code, first_name, last_name, middle_name, email, phone,
            address, city, province, postal_code, birth_date, gender,
            civil_status, employment_type, department, position, job_title,
            base_salary, hourly_rate, daily_rate, sss_no, philhealth_no,
            pagibig_no, tin_no, date_hired, status
        ) VALUES (
            @employee_code, @first_name, @last_name, COALESCE(@middle_name, ''), @email, @phone,
            @address, @city, @province, @postal_code, @birth_date, @gender,
            @civil_status, @employment_type, @department, @position, @job_title,
            @base_salary, @hourly_rate, @daily_rate, @sss_no, @philhealth_no,
            @pagibig_no, @tin_no, @date_hired, @status
        )
    `),
    updateEmployee: db.prepare(`
        UPDATE employees SET
            first_name = @first_name, last_name = @last_name,
            middle_name = COALESCE(@middle_name, ''), email = @email, phone = @phone,
            address = @address, city = @city, province = @province,
            postal_code = @postal_code, birth_date = @birth_date,
            gender = @gender, civil_status = @civil_status,
            employment_type = @employment_type, department = @department,
            position = @position, job_title = @job_title,
            base_salary = @base_salary, hourly_rate = @hourly_rate,
            daily_rate = @daily_rate, sss_no = @sss_no,
            philhealth_no = @philhealth_no, pagibig_no = @pagibig_no,
            tin_no = @tin_no, date_hired = @date_hired, status = @status
        WHERE id = @id
    `),
    deleteEmployee: db.prepare('DELETE FROM employees WHERE id = ?'),

    // Attendance statements
    getAllAttendance: db.prepare('SELECT * FROM attendance ORDER BY work_date DESC, time_in DESC'),
    getAttendanceById: db.prepare('SELECT * FROM attendance WHERE id = ?'),
    getAttendanceByDate: db.prepare('SELECT * FROM attendance WHERE work_date = ? ORDER BY time_in'),
    getAttendanceByEmployee: db.prepare('SELECT * FROM attendance WHERE employee_id = ? ORDER BY work_date DESC, time_in DESC'),
    getAttendanceByDateRange: db.prepare(`
        SELECT * FROM attendance 
        WHERE work_date BETWEEN ? AND ? 
        ORDER BY work_date, time_in
    `),
    insertAttendance: db.prepare(`
        INSERT INTO attendance (
            employee_id, work_date, time_in, time_out, break_minutes,
            day_type, is_holiday, is_rest_day, manual_overtime_hours,
            night_diff_hours, photo_in, photo_out, notes
        ) VALUES (
            @employee_id, @work_date, @time_in, @time_out, @break_minutes,
            @day_type, @is_holiday, @is_rest_day, @manual_overtime_hours,
            @night_diff_hours, @photo_in, @photo_out, @notes
        )
    `),
    updateAttendance: db.prepare(`
        UPDATE attendance SET
            time_out = @time_out, break_minutes = @break_minutes,
            day_type = @day_type, is_holiday = @is_holiday,
            is_rest_day = @is_rest_day,
            manual_overtime_hours = @manual_overtime_hours,
            night_diff_hours = @night_diff_hours,
            photo_out = @photo_out, notes = @notes
        WHERE id = @id
    `),
    deleteAttendance: db.prepare('DELETE FROM attendance WHERE id = ?'),
    deleteAttendanceByEmployee: db.prepare('DELETE FROM attendance WHERE employee_id = ?'),

    // Payroll statements
    getPayrollById: db.prepare('SELECT * FROM payroll WHERE id = ?'),
    getPayrollByEmployee: db.prepare('SELECT * FROM payroll WHERE employee_id = ? ORDER BY period_start DESC'),
    getPayrollByPeriod: db.prepare(`
        SELECT * FROM payroll 
        WHERE period_start = ? AND period_end = ? 
        ORDER BY employee_id
    `),
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
        )
    `),
    deletePayroll: db.prepare('DELETE FROM payroll WHERE id = ?'),
    deletePayrollByEmployee: db.prepare('DELETE FROM payroll WHERE employee_id = ?'),

    // Leave management statements
    getAllLeaveTypes: db.prepare('SELECT * FROM leave_types ORDER BY name'),
    getLeaveTypeById: db.prepare('SELECT * FROM leave_types WHERE id = ?'),
    getLeaveBalance: db.prepare(`
        SELECT * FROM leave_balances 
        WHERE employee_id = ? AND leave_type = ? AND year = ?
    `),
    getLeaveBalancesByEmployee: db.prepare(`
        SELECT * FROM leave_balances 
        WHERE employee_id = ? AND year = ? 
        ORDER BY leave_type
    `),
    insertLeaveBalance: db.prepare(`
        INSERT INTO leave_balances (
            employee_id, leave_type, year, total_days,
            used_days, remaining_days
        ) VALUES (
            @employee_id, @leave_type, @year, @total_days,
            @used_days, @remaining_days
        )
    `),
    updateLeaveBalance: db.prepare(`
        UPDATE leave_balances SET
            used_days = @used_days,
            remaining_days = @remaining_days
        WHERE id = @id
    `),
    getLeaveRequestById: db.prepare('SELECT * FROM leave_requests WHERE id = ?'),
    getLeaveRequestsByEmployee: db.prepare(`
        SELECT * FROM leave_requests 
        WHERE employee_id = ? 
        ORDER BY start_date DESC
    `),
    insertLeaveRequest: db.prepare(`
        INSERT INTO leave_requests (
            employee_id, leave_type, start_date, end_date,
            days, reason, status, remarks
        ) VALUES (
            @employee_id, @leave_type, @start_date, @end_date,
            @days, @reason, @status, @remarks
        )
    `),
    updateLeaveRequest: db.prepare(`
        UPDATE leave_requests SET
            status = @status,
            remarks = @remarks
        WHERE id = @id
    `),
    deleteLeaveRequest: db.prepare('DELETE FROM leave_requests WHERE id = ?'),
    deleteLeaveRequestsByEmployee: db.prepare('DELETE FROM leave_requests WHERE employee_id = ?'),
    deleteLeaveBalancesByEmployee: db.prepare('DELETE FROM leave_balances WHERE employee_id = ?')
};

// Export database and statements
export { db, statements };

export const LEAVE_TYPES = {
    VL: 'Vacation Leave',
    SL: 'Sick Leave',
    SIL: 'Service Incentive Leave',
    ML: 'Maternity Leave',
    PL: 'Paternity Leave',
    SPL: 'Solo Parent Leave',
    BL: 'Bereavement Leave',
    EL: 'Emergency Leave'
};