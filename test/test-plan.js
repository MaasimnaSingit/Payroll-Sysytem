// Test Plan for TGPS Payroll System

const { MockPhotoCapture, TEST_PHOTO, TEST_EMPLOYEE, mockApiResponses } = require('./test-utils');

// Mock APIs
const employeeApi = mockApiResponses.employee;
const attendanceApi = mockApiResponses.attendance;
const payrollApi = mockApiResponses.payroll;
const leaveApi = mockApiResponses.leave;

// PH Leave Types
const LEAVE_TYPES = {
    SIL: 'Service Incentive Leave',
    VL: 'Vacation Leave',
    SL: 'Sick Leave',
    ML: 'Maternity Leave',
    PL: 'Paternity Leave',
    SPL: 'Solo Parent Leave',
    BL: 'Bereavement Leave'
};

// 1. Employee Management Tests
async function testEmployeeManagement() {
    console.log('Testing Employee Management...');

    try {
        // Create employee
        const employee = await employeeApi.create(TEST_EMPLOYEE);
        console.log('✓ Create employee');

        // Verify employee data
        const fetched = await employeeApi.getById(employee.id);
        console.assert(fetched.employee_code === TEST_EMPLOYEE.employee_code, 'Employee code matches');
        console.log('✓ Verify employee data');

        // Update employee
        const updated = await employeeApi.update(employee.id, {
            ...TEST_EMPLOYEE,
            base_salary: 30000,
            hourly_rate: 180,
            daily_rate: 1440
        });
        console.log('✓ Update employee');

        // Delete employee
        await employeeApi.delete(employee.id);
        console.log('✓ Delete employee');

        return true;
    } catch (err) {
        console.error('❌ Employee Management Test Failed:', err);
        return false;
    }
}

// 2. Attendance Tests
async function testAttendance() {
    console.log('Testing Attendance System...');

    try {
        // Create attendance
        const attendance = await attendanceApi.create({
            employee_id: TEST_EMPLOYEE.id,
            work_date: '2024-01-15',
            time_in: '08:00',
            time_out: '17:00',
            break_minutes: 60,
            day_type: 'Regular',
            photo_in: TEST_PHOTO,
            photo_out: TEST_PHOTO
        });
        console.log('✓ Create attendance');

        // Verify calculations
        console.assert(attendance.regular_hours === 8, 'Regular hours correct');
        console.assert(attendance.overtime_hours === 0, 'Overtime hours correct');
        console.log('✓ Verify calculations');

        // Test overtime
        const overtime = await attendanceApi.create({
            employee_id: TEST_EMPLOYEE.id,
            work_date: '2024-01-16',
            time_in: '08:00',
            time_out: '19:00',
            break_minutes: 60,
            day_type: 'Regular',
            photo_in: TEST_PHOTO,
            photo_out: TEST_PHOTO
        });
        console.assert(overtime.overtime_hours === 2, 'Overtime calculation correct');
        console.log('✓ Test overtime');

        // Test night differential
        const nightDiff = await attendanceApi.create({
            employee_id: TEST_EMPLOYEE.id,
            work_date: '2024-01-17',
            time_in: '22:00',
            time_out: '06:00',
            break_minutes: 60,
            day_type: 'Regular',
            photo_in: TEST_PHOTO,
            photo_out: TEST_PHOTO
        });
        console.assert(nightDiff.night_diff_hours === 7, 'Night differential calculation correct');
        console.log('✓ Test night differential');

        // Test holiday
        const holiday = await attendanceApi.create({
            employee_id: TEST_EMPLOYEE.id,
            work_date: '2024-01-18',
            time_in: '08:00',
            time_out: '17:00',
            break_minutes: 60,
            day_type: 'Regular Holiday',
            photo_in: TEST_PHOTO,
            photo_out: TEST_PHOTO
        });
        console.assert(holiday.holiday_pay > 0, 'Holiday pay calculation correct');
        console.log('✓ Test holiday pay');

        return true;
    } catch (err) {
        console.error('❌ Attendance Test Failed:', err);
        return false;
    }
}

// 3. Payroll Tests
async function testPayroll() {
    console.log('Testing Payroll System...');

    try {
        // Calculate payroll
        const payroll = await payrollApi.calculate({
            start_date: '2024-01-01',
            end_date: '2024-01-15'
        });
        console.log('✓ Calculate payroll');

        // Verify deductions
        const employee = payroll.employees.find(e => e.id === TEST_EMPLOYEE.id);
        if (employee) {
            // SSS (based on ₱25,000 monthly)
            console.assert(employee.sss_ee === 1125, 'SSS deduction correct');

            // PhilHealth (4.5% of salary, split between EE and ER)
            console.assert(employee.philhealth_ee === 562.50, 'PhilHealth deduction correct');

            // Pag-IBIG (₱100 standard contribution)
            console.assert(employee.pagibig_ee === 100, 'Pag-IBIG deduction correct');

            console.log('✓ Verify deductions');
        }

        // Generate payslip
        const payslip = await payrollApi.generatePayslip(TEST_EMPLOYEE.id);
        console.log('✓ Generate payslip');

        return true;
    } catch (err) {
        console.error('❌ Payroll Test Failed:', err);
        return false;
    }
}

// 4. Leave Management Tests
async function testLeaveManagement() {
    console.log('Testing Leave Management...');

    try {
        // Submit leave request
        const request = await leaveApi.submit({
            employee_id: TEST_EMPLOYEE.id,
            leave_type: 'VL',
            start_date: '2024-02-01',
            end_date: '2024-02-03',
            reason: 'Vacation',
            days: 3
        });
        console.log('✓ Submit leave request');

        // Verify leave balance
        const balance = await leaveApi.getBalances(TEST_EMPLOYEE.id);
        console.assert(balance.VL === 12, 'Leave balance updated correctly');
        console.log('✓ Verify leave balance');

        // Approve request
        await leaveApi.approve(request.id, 'Approved');
        console.log('✓ Approve leave request');

        // Test all leave types
        for (const type of Object.keys(LEAVE_TYPES)) {
            const typeRequest = await leaveApi.submit({
                employee_id: TEST_EMPLOYEE.id,
                leave_type: type,
                start_date: '2024-03-01',
                end_date: '2024-03-01',
                reason: 'Test leave type',
                days: 1
            });
            console.log(`✓ Test ${type} leave type`);
        }

        return true;
    } catch (err) {
        console.error('❌ Leave Management Test Failed:', err);
        return false;
    }
}

// 5. Mobile Tests
async function testMobile() {
    console.log('Testing Mobile Features...');

    try {
        // Test photo capture
        const photo = await new Promise((resolve) => {
            const capture = new MockPhotoCapture({
                onCapture: (photo) => resolve(photo),
                onError: (err) => {
                    throw err;
                }
            });
        });
        console.log('✓ Test photo capture');

        // Verify photo compression
        const img = new window.Image();
        img.src = photo;
        await new Promise(resolve => img.onload = resolve);
        console.assert(img.width <= 800, 'Photo compressed correctly');
        console.log('✓ Verify photo compression');

        return true;
    } catch (err) {
        console.error('❌ Mobile Test Failed:', err);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('Starting System Tests...');

    const results = {
        employeeManagement: await testEmployeeManagement(),
        attendance: await testAttendance(),
        payroll: await testPayroll(),
        leaveManagement: await testLeaveManagement(),
        mobile: await testMobile()
    };

    console.log('\nTest Results:');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✓' : '❌'} ${test}`);
    });

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\n${allPassed ? '✓ All tests passed!' : '❌ Some tests failed.'}`);

    return allPassed;
}

// Export test functions
module.exports = {
    testEmployeeManagement,
    testAttendance,
    testPayroll,
    testLeaveManagement,
    testMobile,
    runTests
};