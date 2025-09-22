// Test Utilities

// Mock PhotoCapture component
class MockPhotoCapture {
    constructor({ onCapture, onError }) {
        // Simulate successful photo capture
        setTimeout(() => {
            onCapture(TEST_PHOTO);
        }, 100);
    }
}

// Test photo data (1x1 transparent PNG)
const TEST_PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Mock Image for photo tests
class MockImage {
    constructor() {
        this.width = 800;
        this.height = 600;
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 100);
    }
}

// Mock API responses
const mockApiResponses = {
    // Employee API mocks
    employee: {
        create: (data) => ({ id: 1, ...data }),
        getById: (id) => ({ id, ...TEST_EMPLOYEE }),
        update: (id, data) => ({ id, ...data }),
        delete: () => true
    },

    // Attendance API mocks
    attendance: {
        create: (data) => ({
            id: 1,
            ...data,
            regular_hours: 8,
            overtime_hours: data.time_out === '19:00' ? 2 : 0,
            night_diff_hours: data.time_in === '22:00' ? 7 : 0,
            holiday_pay: data.day_type.includes('Holiday') ? data.daily_rate : 0
        })
    },

    // Payroll API mocks
    payroll: {
        calculate: () => ({
            employees: [{
                id: 1,
                ...TEST_EMPLOYEE,
                sss_ee: 1125,
                philhealth_ee: 562.50,
                pagibig_ee: 100,
                withholding_tax: 0
            }]
        }),
        generatePayslip: () => ({
            id: 1,
            employee: TEST_EMPLOYEE,
            period: {
                start_date: '2024-01-01',
                end_date: '2024-01-15'
            },
            calculations: {
                gross_pay: 15000,
                net_pay: 13212.50
            }
        })
    },

    // Leave API mocks
    leave: {
        submit: (data) => ({ id: 1, status: 'pending', ...data }),
        getBalances: () => ({
            VL: 12,
            SL: 15,
            SIL: 5
        }),
        approve: () => ({ status: 'approved' })
    }
};

// Test employee data
const TEST_EMPLOYEE = {
    employee_code: 'TEST001',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    email: 'juan@test.com',
    phone: '09123456789',
    address: '123 Test St.',
    city: 'Manila',
    province: 'Metro Manila',
    postal_code: '1000',
    birth_date: '1990-01-01',
    gender: 'Male',
    civil_status: 'Single',
    employment_type: 'Regular',
    position: 'Software Engineer',
    job_title: 'Senior Developer',
    base_salary: 25000,
    hourly_rate: 150,
    daily_rate: 1200,
    sss_no: '11-2233445-6',
    philhealth_no: '12-345678901-2',
    pagibig_no: '1234-5678-9012',
    tin_no: '123-456-789-000',
    date_hired: '2024-01-01'
};

// Mock window object
global.window = {
    Image: MockImage
};

module.exports = {
    MockPhotoCapture,
    TEST_PHOTO,
    TEST_EMPLOYEE,
    mockApiResponses
};
