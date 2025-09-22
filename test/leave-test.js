// Leave Management System Test
const assert = require('assert');
const { employeeApi } = require('../src/services/employeeApi');
const { leaveApi } = require('../src/services/leaveApi');

// Test data
const testEmployee = {
    employee_code: 'EMP001',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    email: 'juan@example.com',
    phone: '+63 912 345 6789',
    address: '123 Main St',
    city: 'Manila',
    province: 'Metro Manila',
    postal_code: '1000',
    birth_date: '1990-01-01',
    gender: 'Male',
    civil_status: 'Single',
    employment_type: 'Regular',
    position: 'Staff',
    job_title: 'Office Staff',
    base_salary: 20000,
    sss_no: '12-3456789-1',
    philhealth_no: '12-345678901-2',
    pagibig_no: '1234-5678-9012',
    tin_no: '123-456-789-012',
    date_hired: '2023-01-01',
    status: 'active'
};

// Test leave request
const testLeaveRequest = {
    leave_type: 'VL',
    start_date: '2024-03-20',
    end_date: '2024-03-22',
    reason: 'Vacation'
};

describe('Leave Management System', () => {
    let employeeId;

    before(async () => {
        // Create test employee
        const employee = await employeeApi.create(testEmployee);
        employeeId = employee.id;
    });

    describe('Leave Types', () => {
        it('should get all leave types', async () => {
            const types = await leaveApi.getLeaveTypes();
            assert(types.length > 0);
            assert(types.find(t => t.id === 'SIL'));
            assert(types.find(t => t.id === 'VL'));
            assert(types.find(t => t.id === 'SL'));
            assert(types.find(t => t.id === 'ML'));
            assert(types.find(t => t.id === 'PL'));
            assert(types.find(t => t.id === 'SPL'));
            assert(types.find(t => t.id === 'BL'));
        });
    });

    describe('Leave Balances', () => {
        it('should initialize leave balances for new employee', async () => {
            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.total_days === 15);
            assert(balances.VL.used_days === 0);
            assert(balances.VL.remaining_days === 15);
            assert(balances.SL.total_days === 15);
            assert(balances.SL.used_days === 0);
            assert(balances.SL.remaining_days === 15);
        });
    });

    describe('Leave Requests', () => {
        it('should submit leave request', async () => {
            const request = await leaveApi.submitRequest({
                ...testLeaveRequest,
                employee_id: employeeId
            });
            assert(request.id);
            assert(request.status === 'pending');
            assert(request.days === 3);
        });

        it('should get employee leave requests', async () => {
            const requests = await leaveApi.getRequests(employeeId);
            assert(requests.length > 0);
            assert(requests[0].leave_type === testLeaveRequest.leave_type);
            assert(requests[0].status === 'pending');
        });

        it('should approve leave request', async () => {
            const requests = await leaveApi.getRequests(employeeId);
            const request = await leaveApi.approveRequest(requests[0].id);
            assert(request.status === 'approved');

            // Check balance updated
            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.used_days === 3);
            assert(balances.VL.remaining_days === 12);
        });

        it('should reject leave request', async () => {
            // Submit new request
            const request = await leaveApi.submitRequest({
                ...testLeaveRequest,
                employee_id: employeeId,
                start_date: '2024-04-01',
                end_date: '2024-04-03'
            });

            const rejected = await leaveApi.rejectRequest(request.id, 'Not approved');
            assert(rejected.status === 'rejected');
            assert(rejected.remarks === 'Not approved');

            // Check balance unchanged
            const balances = await leaveApi.getBalances(employeeId);
            assert(balances.VL.used_days === 3);
            assert(balances.VL.remaining_days === 12);
        });

        it('should handle insufficient balance', async () => {
            try {
                await leaveApi.submitRequest({
                    ...testLeaveRequest,
                    employee_id: employeeId,
                    start_date: '2024-05-01',
                    end_date: '2024-05-31'
                });
                assert.fail('Should throw insufficient balance error');
            } catch (err) {
                assert(err.message === 'Insufficient leave balance');
            }
        });
    });

    after(async () => {
        // Cleanup test employee
        await employeeApi.delete(employeeId);
    });
});