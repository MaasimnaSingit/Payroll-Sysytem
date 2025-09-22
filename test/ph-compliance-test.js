// PH Compliance Test
const assert = require('assert');
const { employeeApi } = require('../src/services/employeeApi');
const { payrollApi } = require('../src/services/payrollApi');
const { attendanceApi } = require('../src/services/attendanceApi');
const { leaveApi } = require('../src/services/leaveApi');

// Test data
const testEmployee = {
    employee_code: 'EMP002',
    first_name: 'Maria',
    last_name: 'Santos',
    email: 'maria@example.com',
    phone: '+63 912 345 6789',
    address: '123 Main St',
    city: 'Manila',
    province: 'Metro Manila',
    postal_code: '1000',
    birth_date: '1990-01-01',
    gender: 'Female',
    civil_status: 'Single',
    employment_type: 'Regular',
    position: 'Staff',
    job_title: 'Office Staff',
    base_salary: 25000,
    sss_no: '12-3456789-2',
    philhealth_no: '12-345678901-3',
    pagibig_no: '1234-5678-9013',
    tin_no: '123-456-789-013',
    date_hired: '2023-01-01',
    status: 'active'
};

// Test photo data
const testPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAAAAP/bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIABAABAADASIA';

describe('PH Compliance', () => {
    let employeeId;

    before(async () => {
        // Create test employee
        const employee = await employeeApi.create(testEmployee);
        employeeId = employee.id;
    });

    describe('SSS Contributions', () => {
        it('should calculate SSS correctly for ₱25,000', async () => {
            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-01',
                period_end: '2024-03-15'
            });

            // 2024 SSS Table: ₱25,000 = ₱1,125 EE contribution
            assert(payroll.sss_ee === 1125);
        });
    });

    describe('PhilHealth Contributions', () => {
        it('should calculate PhilHealth correctly for ₱25,000', async () => {
            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-01',
                period_end: '2024-03-15'
            });

            // 2024 PhilHealth: 4% (₱25,000 × 0.04 = ₱1,000), split 50/50
            assert(payroll.philhealth_ee === 500);
        });
    });

    describe('Pag-IBIG Contributions', () => {
        it('should calculate Pag-IBIG correctly for ₱25,000', async () => {
            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-01',
                period_end: '2024-03-15'
            });

            // 2024 Pag-IBIG: 2% for ₱25,000
            assert(payroll.pagibig_ee === 500);
        });
    });

    describe('BIR Tax Calculations', () => {
        it('should calculate withholding tax correctly for ₱25,000', async () => {
            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-01',
                period_end: '2024-03-15'
            });

            // Monthly taxable: ₱25,000 - (₱1,125 + ₱500 + ₱500) = ₱22,875
            // Annual: ₱274,500
            // Tax bracket: 0-250,000 = 0%
            assert(payroll.withholding_tax === 0);
        });
    });

    describe('Overtime Calculations', () => {
        it('should calculate regular overtime correctly', async () => {
            // Add attendance with 2 hours overtime
            await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-01',
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

            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-01',
                period_end: '2024-03-01'
            });

            // Hourly: ₱142.05 (₱25,000 ÷ 22 ÷ 8)
            // OT Rate: 125% = ₱177.56
            // 2 hours = ₱355.12
            assert(Math.abs(payroll.overtime_pay - 355.12) < 0.01);
        });

        it('should calculate rest day overtime correctly', async () => {
            // Add attendance with 2 hours overtime on rest day
            await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-02',
                time_in: '08:00',
                time_out: '18:00',
                break_minutes: 60,
                day_type: 'Rest day',
                is_holiday: false,
                is_rest_day: true,
                manual_overtime_hours: 2,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-02',
                period_end: '2024-03-02'
            });

            // Hourly: ₱142.05
            // Rest day OT Rate: 130% = ₱184.67
            // 2 hours = ₱369.34
            assert(Math.abs(payroll.overtime_pay - 369.34) < 0.01);
        });

        it('should calculate holiday overtime correctly', async () => {
            // Add attendance with 2 hours overtime on holiday
            await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-03',
                time_in: '08:00',
                time_out: '18:00',
                break_minutes: 60,
                day_type: 'Regular Holiday',
                is_holiday: true,
                is_rest_day: false,
                manual_overtime_hours: 2,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-03',
                period_end: '2024-03-03'
            });

            // Hourly: ₱142.05
            // Holiday OT Rate: 200% = ₱284.10
            // 2 hours = ₱568.20
            assert(Math.abs(payroll.overtime_pay - 568.20) < 0.01);
        });
    });

    describe('Night Differential', () => {
        it('should calculate night differential correctly', async () => {
            // Add attendance with night shift
            await attendanceApi.create({
                employee_id: employeeId,
                work_date: '2024-03-04',
                time_in: '22:00',
                time_out: '06:00',
                break_minutes: 60,
                day_type: 'Regular',
                is_holiday: false,
                is_rest_day: false,
                photo_in: testPhoto,
                photo_out: testPhoto
            });

            const payroll = await payrollApi.calculate({
                employee_id: employeeId,
                period_start: '2024-03-04',
                period_end: '2024-03-04'
            });

            // Hourly: ₱142.05
            // Night Diff Rate: 10% = ₱14.21
            // 7 hours (10PM-6AM minus 1 hour break) = ₱99.47
            assert(Math.abs(payroll.night_diff_pay - 99.47) < 0.01);
        });
    });

    describe('Leave Types', () => {
        it('should have all required PH leave types', async () => {
            const types = await leaveApi.getLeaveTypes();
            const typeIds = types.map(t => t.id);

            assert(typeIds.includes('SIL')); // Service Incentive Leave
            assert(typeIds.includes('VL')); // Vacation Leave
            assert(typeIds.includes('SL')); // Sick Leave
            assert(typeIds.includes('ML')); // Maternity Leave
            assert(typeIds.includes('PL')); // Paternity Leave
            assert(typeIds.includes('SPL')); // Solo Parent Leave
            assert(typeIds.includes('BL')); // Bereavement Leave
        });

        it('should initialize SIL after one year', async () => {
            // Create employee with > 1 year service
            const oldEmployee = await employeeApi.create({
                ...testEmployee,
                employee_code: 'EMP003',
                email: 'old@example.com',
                sss_no: '12-3456789-3',
                philhealth_no: '12-345678901-4',
                pagibig_no: '1234-5678-9014',
                tin_no: '123-456-789-014',
                date_hired: '2022-01-01'
            });

            const balances = await leaveApi.getBalances(oldEmployee.id);
            assert(balances.SIL.total_days === 5);
            assert(balances.SIL.remaining_days === 5);

            // Cleanup
            await employeeApi.delete(oldEmployee.id);
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