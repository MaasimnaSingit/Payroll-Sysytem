// Final System Test
const assert = require('assert');
const { employeeApi } = require('../src/services/employeeApi');
const { attendanceApi } = require('../src/services/attendanceApi');
const { payrollApi } = require('../src/services/payrollApi');
const { leaveApi } = require('../src/services/leaveApi');
const { authApi } = require('../src/services/authApi');
const { testEmployee, testPhoto, testAttendance, testLeaveRequest, testCredentials } = require('./test-data');

describe('Final System Test', () => {
    let employeeId;
    let employeeToken;

    before(async () => {
        // Create test employee
        const employee = await employeeApi.create(testEmployee);
        employeeId = employee.id;

        // Initialize leave balances
        await leaveApi.getBalances(employeeId);
        await leaveApi.getBalances(employeeId);
        const balances = await leaveApi.getBalances(employeeId);
        assert(balances.VL.total_days === 15);
        assert(balances.VL.remaining_days === 15);
    });

    describe('Admin Access', () => {
        it('should login as admin', async () => {
            const result = await authApi.login(testCredentials.admin);

            assert(result.token);
            assert(result.user.role === 'admin');
        });
    });

    describe('Employee Management', () => {
        it('should calculate rates correctly', async () => {
            const employee = await employeeApi.getById(employeeId);
            console.log('Employee rates:', {
                base_salary: employee.base_salary,
                daily_rate: employee.daily_rate,
                hourly_rate: employee.hourly_rate
            });
            assert(Math.abs(employee.daily_rate - 1136.36) < 0.1); // 25000 ÷ 22
            assert(Math.abs(employee.hourly_rate - 142.05) < 0.1); // 1136.36 ÷ 8
        });

        it('should initialize leave balances', async () => {
            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.total_days === 15);
            assert(balances.VL.used_days === 0);
            assert(balances.VL.remaining_days === 15);
            assert(balances.SL.total_days === 15);
            assert(balances.SL.used_days === 0);
            assert(balances.SL.remaining_days === 15);
        });
    });

    describe('Employee Portal', () => {
        it('should create employee credentials', async () => {
            try {
                const result = await authApi.createEmployeeAccess({
                    employee_id: employeeId,
                    password: testCredentials.employee.password
                });

                assert(result.success);
            } catch (error) {
                // If user already exists, that's okay
                if (error.message.includes('already has access')) {
                    console.log('Employee access already exists, continuing...');
                } else {
                    throw error;
                }
            }
        });

        it('should login as employee', async () => {
            const result = await authApi.login(testCredentials.employee);

            assert(result.token);
            assert(result.user.role === 'employee');
            employeeToken = result.token;
        });
    });

    describe('Attendance System', () => {
        it('should clock in with photo', async () => {
            const attendance = await attendanceApi.create({
                employee_id: employeeId,
                work_date: testAttendance.work_date,
                time_in: testAttendance.time_in,
                day_type: testAttendance.day_type,
                is_holiday: testAttendance.is_holiday,
                is_rest_day: testAttendance.is_rest_day,
                photo_in: testAttendance.photo_in
            });

            assert(attendance.id);
            assert(attendance.photo_in);
        });

        it('should clock out with photo', async () => {
            const records = await attendanceApi.getAll({ 
                employee_id: employeeId,
                date: testAttendance.work_date
            });

            const updated = await attendanceApi.update(records[0].id, {
                time_out: testAttendance.time_out,
                break_minutes: testAttendance.break_minutes,
                photo_out: testAttendance.photo_out
            });

            assert(Math.abs(updated.regular_hours - 8) < 0.01);
            assert(updated.photo_out);
        });

        it('should handle overtime', async () => {
            const attendance = await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-19',
                time_in: '08:00',
                time_out: '18:00',
                break_minutes: 60,
                day_type: 'Regular',
                is_holiday: false,
                is_rest_day: false,
                manual_overtime_hours: 2,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            assert(attendance.manual_overtime_hours === 2);
        });

        it('should handle night differential', async () => {
            const attendance = await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-20',
                time_in: '22:00',
                time_out: '06:00',
                break_minutes: 60,
                day_type: 'Regular',
                is_holiday: false,
                is_rest_day: false,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            assert(Math.abs(attendance.night_diff_hours - 7) < 0.01);
        });
    });

    describe('Payroll System', () => {
        it('should calculate regular payroll', async () => {
            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-18',
                period_end: '2024-03-20'
            });

            console.log('Payroll data:', {
                regular_hours: payroll.regular_hours,
                basic_pay: payroll.basic_pay,
                overtime_pay: payroll.overtime_pay,
                night_diff_pay: payroll.night_diff_pay,
                gross_pay: payroll.gross_pay
            });

            // Regular hours = 24 (3 days × 8 hours)
            assert(Math.abs(payroll.regular_hours - 24) < 0.1);
            assert(Math.abs(payroll.basic_pay - 3409.20) < 0.5); // 24 × 142.05

            // Overtime = 2 hours × 1.25 × 142.05
            assert(Math.abs(payroll.overtime_pay - 355.12) < 0.5);

            // Night diff = 7 hours × 0.1 × 142.05
            assert(Math.abs(payroll.night_diff_pay - 99.44) < 0.5);

            // Government deductions
            assert(payroll.sss_contribution === 1125.00); // From 2024 table
            assert(payroll.philhealth_contribution === 500.00); // 4% of 25000 ÷ 2
            assert(payroll.pagibig_contribution === 500.00); // 2% of 25000

            // Withholding tax
            const taxableIncome = payroll.gross_pay - (payroll.sss_contribution + payroll.philhealth_contribution + payroll.pagibig_contribution);
            assert(payroll.bir_tax === 0); // Below 250k annually
        });

        it('should calculate holiday pay', async () => {
            const attendance = await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-21',
                time_in: '08:00',
                time_out: '17:00',
                break_minutes: 60,
                day_type: 'Regular Holiday',
                is_holiday: true,
                is_rest_day: false,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-21',
                period_end: '2024-03-21'
            });

            assert(Math.abs(payroll.holiday_pay - 1136.36) < 0.01); // Daily rate
        });
    });

    describe('Leave Management', () => {
        let requestId;

        it('should submit leave request', async () => {
            // Initialize leave balances
            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.total_days === 15);
            assert(balances.VL.used_days === 0);
            assert(balances.VL.remaining_days === 15);

            const request = await leaveApi.submitRequest({
                employee_id: employeeId,
                ...testLeaveRequest
            });

            assert(request.id);
            assert(request.status === 'pending');
            assert(request.days === 3);
            requestId = request.id;
        });

        it('should approve leave request', async () => {
            const request = await leaveApi.approveRequest(requestId);
            assert(request.status === 'approved');

            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.used_days === 3);
            assert(balances.VL.remaining_days === 12);
        });
    });

    after(async () => {
        // Delete all attendance records first
        const records = await attendanceApi.getAll({ employee_id: employeeId });
        for (const record of records) {
            await attendanceApi.delete(record.id);
        }

        // Then delete employee
        await employeeApi.delete(employeeId);
    });
});