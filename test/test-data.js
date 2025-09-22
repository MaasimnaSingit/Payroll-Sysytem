// Test data
module.exports = {
    // Test employee
    testEmployee: {
        employee_code: 'TEST001',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan@test.com',
        phone: '+63 912 345 6789',
        address: '123 Test St',
        city: 'Manila',
        province: 'Metro Manila',
        postal_code: '1000',
        birth_date: '1990-01-01',
        gender: 'Male',
        civil_status: 'Single',
        employment_type: 'Regular',
        position: 'Staff',
        job_title: 'Test Staff',
        base_salary: 25000.00,
        sss_no: '12-3456789-1',
        philhealth_no: '12-345678901-2',
        pagibig_no: '1234-5678-9012',
        tin_no: '123-456-789-123',
        date_hired: '2023-01-01',
        status: 'active'
    },

    // Test photo data
    testPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAAAAP/bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIABAABAADASIA/9k=',

    // Test attendance
    testAttendance: {
        work_date: '2024-03-18',
        time_in: '08:00',
        time_out: '17:00',
        break_minutes: 60,
        day_type: 'Regular',
        is_holiday: false,
        is_rest_day: false,
        manual_overtime_hours: 0,
        photo_in: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAAAAP/bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIABAABAADASIA/9k=',
        photo_out: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAAAAP/bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIABAABAADASIA/9k='
    },

    // Test leave request
    testLeaveRequest: {
        leave_type: 'VL',
        start_date: '2024-04-01',
        end_date: '2024-04-03',
        reason: 'Vacation'
    },

    // Test credentials
    testCredentials: {
        admin: {
            username: 'Tgpspayroll',
            password: 'Tgpspayroll16**'
        },
        employee: {
            username: 'juan@test.com',
            password: 'Test123**'
        }
    }
};