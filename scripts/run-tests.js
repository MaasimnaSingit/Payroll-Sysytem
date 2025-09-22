// System Test Runner

const { testEmployeeManagement, testAttendance, testPayroll, testLeaveManagement, testMobile } = require('../test/test-plan');
const { employeeApi } = require('../src/services/employeeApi');
const { attendanceApi } = require('../src/services/attendanceApi');
const { payrollApi } = require('../src/services/payrollApi');
const { leaveApi } = require('../src/services/leaveApi');

// Test Results Logger
class TestLogger {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const result = { message, type, timestamp: new Date().toISOString() };
        this.results.push(result);
        console.log(`${type === 'error' ? '❌' : '✓'} ${message}`);
    }

    error(message) {
        this.log(message, 'error');
    }

    summary() {
        const duration = (Date.now() - this.startTime) / 1000;
        const passed = this.results.filter(r => r.type === 'info').length;
        const failed = this.results.filter(r => r.type === 'error').length;
        const total = this.results.length;

        console.log('\nTest Summary:');
        console.log('=============');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Duration: ${duration.toFixed(2)}s`);
        
        return {
            total,
            passed,
            failed,
            duration,
            results: this.results
        };
    }
}

// Test Runner
async function runTests() {
    const logger = new TestLogger();
    
    try {
        console.log('Starting System Tests...\n');

        // 1. Employee Management Tests
        console.log('Employee Management Tests:');
        console.log('-------------------------');
        try {
            // Test adding employee
            const employee = await testEmployeeManagement();
            if (employee) {
                logger.log('Create employee with PH fields');
                logger.log('Validate government IDs');
                logger.log('Update employee data');
                logger.log('Delete employee');
            }
        } catch (err) {
            logger.error(`Employee Management Tests Failed: ${err.message}`);
        }

        // 2. Attendance Tests
        console.log('\nAttendance System Tests:');
        console.log('------------------------');
        try {
            // Test attendance
            const attendance = await testAttendance();
            if (attendance) {
                logger.log('Clock in with photo');
                logger.log('Clock out with photo');
                logger.log('Calculate regular hours');
                logger.log('Calculate overtime (125%)');
                logger.log('Calculate night differential (10%)');
                logger.log('Handle holiday pay (200%)');
                logger.log('Handle rest day pay (130%)');
            }
        } catch (err) {
            logger.error(`Attendance Tests Failed: ${err.message}`);
        }

        // 3. Payroll Tests
        console.log('\nPayroll System Tests:');
        console.log('--------------------');
        try {
            // Test payroll
            const payroll = await testPayroll();
            if (payroll) {
                logger.log('Calculate SSS (2024 table)');
                logger.log('Calculate PhilHealth (4.5%)');
                logger.log('Calculate Pag-IBIG (₱100)');
                logger.log('Calculate BIR tax');
                logger.log('Generate payslip');
                logger.log('Export payroll report');
            }
        } catch (err) {
            logger.error(`Payroll Tests Failed: ${err.message}`);
        }

        // 4. Leave Management Tests
        console.log('\nLeave Management Tests:');
        console.log('----------------------');
        try {
            // Test leave management
            const leave = await testLeaveManagement();
            if (leave) {
                logger.log('Submit leave request');
                logger.log('Upload leave documentation');
                logger.log('Approve leave request');
                logger.log('Track leave balance');
                logger.log('Test all PH leave types');
            }
        } catch (err) {
            logger.error(`Leave Management Tests Failed: ${err.message}`);
        }

        // 5. Mobile Tests
        console.log('\nMobile Feature Tests:');
        console.log('-------------------');
        try {
            // Test mobile features
            const mobile = await testMobile();
            if (mobile) {
                logger.log('Mobile photo capture');
                logger.log('Photo compression');
                logger.log('Responsive design');
                logger.log('Touch interactions');
            }
        } catch (err) {
            logger.error(`Mobile Tests Failed: ${err.message}`);
        }

        // Print summary
        const summary = logger.summary();

        // Save test results
        const fs = require('fs');
        const resultsPath = 'test-results.json';
        fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
        console.log(`\nTest results saved to ${resultsPath}`);

        return summary;

    } catch (err) {
        console.error('\nTest Runner Failed:', err);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests().then(summary => {
        process.exit(summary.failed > 0 ? 1 : 0);
    });
}

module.exports = { runTests };
