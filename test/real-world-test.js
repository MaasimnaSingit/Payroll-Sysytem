// Real-World System Test
const { employeeApi } = require('../src/services/employeeApi');
const { attendanceApi } = require('../src/services/attendanceApi');
const { payrollApi } = require('../src/services/payrollApi');
const { leaveApi } = require('../src/services/leaveApi');
const { db, statements } = require('../src/services/database');
const { TEST_EMPLOYEES, TEST_ATTENDANCE, TEST_LEAVE, TEST_PHOTO } = require('./test-data');
const { round2, calculateBaseSalary, calculateHourlyRate } = require('../src/services/validation');

// Test Logger
class TestLogger {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    log(feature, test, status, details = null) {
        const result = {
            feature,
            test,
            status,
            details,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        console.log(`${status === 'passed' ? '✓' : '❌'} ${feature} - ${test}`);
        if (details) console.log(`  ${details}`);
    }

    summarize() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.status === 'passed').length;
        const duration = (Date.now() - this.startTime) / 1000;

        return {
            total_tests: total,
            passed_tests: passed,
            failed_tests: total - passed,
            duration,
            success_rate: (passed / total * 100).toFixed(2) + '%',
            results: this.results
        };
    }
}

// Test employee management
async function testEmployeeManagement(logger) {
    console.log('\nTesting Employee Management:');
    console.log('-------------------------');

    try {
        // Clear existing data
        db.prepare('DELETE FROM employees').run();

        // Add employees
        const employees = [];
        for (const data of TEST_EMPLOYEES) {
            const employee = await employeeApi.create(data);
            employees.push(employee);
            logger.log('Employee', `Create ${employee.employee_code}`, 'passed');

            // Verify data
            const stored = await employeeApi.getById(employee.id);
            const verified = Object.keys(data).every(key => stored[key] === data[key]);
            logger.log('Employee', `Verify ${employee.employee_code}`, verified ? 'passed' : 'failed');
        }

        // Update employee
        const newDailyRate = 1363.64;
        const newBaseSalary = calculateBaseSalary(newDailyRate);
        const newHourlyRate = calculateHourlyRate(newDailyRate);

        const updated = await employeeApi.update(employees[0].id, {
            ...employees[0],
            daily_rate: newDailyRate,
            base_salary: newBaseSalary,
            hourly_rate: newHourlyRate
        });
        logger.log('Employee', 'Update salary', updated ? 'passed' : 'failed');

        return employees;
    } catch (err) {
        console.error('Employee Management Test Failed:', err);
        return false;
    }
}

// Test attendance system
async function testAttendanceSystem(logger, employees) {
    console.log('\nTesting Attendance System:');
    console.log('------------------------');

    try {
        // Clear existing data
        db.prepare('DELETE FROM attendance').run();
        db.prepare('DELETE FROM photos').run();

        const attendance = [];

        // Add attendance records
        for (const data of TEST_ATTENDANCE) {
            const record = await attendanceApi.create({
                ...data,
                employee_id: employees[0].id
            });
            attendance.push(record);
            logger.log('Attendance', `Record ${data.day_type}`, record ? 'passed' : 'failed');

            // Verify calculations
            if (record) {
                // Regular hours
                const expectedHours = data.time_out ? 8 : 0;
                logger.log('Attendance', 'Regular hours',
                    record.regular_hours === expectedHours ? 'passed' : 'failed',
                    `Expected: ${expectedHours}, Got: ${record.regular_hours}`
                );

                // Overtime
                const expectedOT = data.manual_overtime_hours || 0;
                logger.log('Attendance', 'Overtime hours',
                    record.overtime_hours === expectedOT ? 'passed' : 'failed',
                    `Expected: ${expectedOT}, Got: ${record.overtime_hours}`
                );

                // Night differential
                const expectedND = data.time_in === '22:00' ? 7 : 0;
                logger.log('Attendance', 'Night differential',
                    record.night_diff_hours === expectedND ? 'passed' : 'failed',
                    `Expected: ${expectedND}, Got: ${record.night_diff_hours}`
                );
            }
        }

        return attendance;
    } catch (err) {
        console.error('Attendance System Test Failed:', err);
        return false;
    }
}

// Test payroll system
async function testPayrollSystem(logger, employees) {
    console.log('\nTesting Payroll System:');
    console.log('---------------------');

    try {
        // Clear existing data
        db.prepare('DELETE FROM payroll').run();

        // Calculate payroll
        const payroll = await payrollApi.calculate({
            start_date: '2024-01-01',
            end_date: '2024-01-15'
        });
        logger.log('Payroll', 'Calculate', payroll ? 'passed' : 'failed');

        // Verify calculations
        const employee = payroll.employees.find(e => e.employee_id === employees[0].id);
        if (employee) {
            // SSS (based on ₱30,000 monthly)
            logger.log('Payroll', 'SSS',
                employee.sss_ee === 1125 ? 'passed' : 'failed',
                `Expected: 1125, Got: ${employee.sss_ee}`
            );

            // PhilHealth (4.5% of salary)
            logger.log('Payroll', 'PhilHealth',
                employee.philhealth_ee === 675 ? 'passed' : 'failed',
                `Expected: 675, Got: ${employee.philhealth_ee}`
            );

            // Pag-IBIG (₱100)
            logger.log('Payroll', 'Pag-IBIG',
                employee.pagibig_ee === 100 ? 'passed' : 'failed',
                `Expected: 100, Got: ${employee.pagibig_ee}`
            );
        }

        // Save payroll
        const saved = await payrollApi.save(payroll);
        logger.log('Payroll', 'Save', saved ? 'passed' : 'failed');

        return payroll;
    } catch (err) {
        console.error('Payroll System Test Failed:', err);
        return false;
    }
}

// Test leave management
async function testLeaveManagement(logger, employees) {
    console.log('\nTesting Leave Management:');
    console.log('------------------------');

    try {
        // Clear existing data
        db.prepare('DELETE FROM leave_requests').run();
        db.prepare('DELETE FROM leave_balances').run();

        // Initialize leave balances
        const balances = await leaveApi.getBalances(employees[0].id);
        logger.log('Leave', 'Initialize balances', balances ? 'passed' : 'failed');

        // Submit leave requests
        for (const data of TEST_LEAVE) {
            const request = await leaveApi.submit({
                ...data,
                employee_id: employees[0].id
            });
            logger.log('Leave', `Submit ${data.leave_type}`, request ? 'passed' : 'failed');

            if (request) {
                // Approve request
                const approved = await leaveApi.approve(request.id, 'Approved');
                logger.log('Leave', `Approve ${data.leave_type}`, approved ? 'passed' : 'failed');

                // Verify balance
                const updatedBalance = await leaveApi.getBalances(employees[0].id);
                const expectedBalance = data.leave_type === 'VL' ? 12 : 14; // VL: 15-3, SL: 15-1
                logger.log('Leave', `Balance ${data.leave_type}`,
                    updatedBalance[data.leave_type] === expectedBalance ? 'passed' : 'failed',
                    `Expected: ${expectedBalance}, Got: ${updatedBalance[data.leave_type]}`
                );
            }
        }

        return true;
    } catch (err) {
        console.error('Leave Management Test Failed:', err);
        return false;
    }
}

// Run complete system test
async function runSystemTest() {
    const logger = new TestLogger();
    console.log('Starting Complete System Test...\n');

    try {
        // Run all tests
        const employees = await testEmployeeManagement(logger);
        if (employees) {
            await testAttendanceSystem(logger, employees);
            await testPayrollSystem(logger, employees);
            await testLeaveManagement(logger, employees);
        }

        // Print summary
        const summary = logger.summarize();
        console.log('\nTest Summary:');
        console.log('------------');
        console.log(`Total Tests: ${summary.total_tests}`);
        console.log(`Passed Tests: ${summary.passed_tests}`);
        console.log(`Failed Tests: ${summary.failed_tests}`);
        console.log(`Success Rate: ${summary.success_rate}`);
        console.log(`Duration: ${summary.duration.toFixed(2)}s`);

        // Save results
        const fs = require('fs');
        fs.writeFileSync(
            'system-test-results.json',
            JSON.stringify(summary, null, 2)
        );

        // Final status
        const passed = summary.failed_tests === 0;
        console.log(`\n${passed ? '✓ System is ready for client use!' : '❌ System needs attention.'}`);

        return passed;
    } catch (err) {
        console.error('\nSystem Test Failed:', err);
        return false;
    }
}

// Run test if called directly
if (require.main === module) {
    runSystemTest().then(passed => {
        process.exit(passed ? 0 : 1);
    });
}

module.exports = { runSystemTest };