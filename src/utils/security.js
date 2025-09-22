// Security Enhancements

// Input validation patterns
const VALIDATION_PATTERNS = {
    // Employee validation
    EMPLOYEE_CODE: /^[A-Z0-9]{3,10}$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^(\+63|0)[0-9]{10}$/,
    SSS: /^\d{2}-\d{7}-\d$/,
    PHILHEALTH: /^\d{2}-\d{9}-\d$/,
    PAGIBIG: /^\d{4}-\d{4}-\d{4}$/,
    TIN: /^\d{3}-\d{3}-\d{3}-\d{3}$/,

    // Amount validation
    AMOUNT: /^\d+(\.\d{1,2})?$/,
    
    // Date validation
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

// Data sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate employee data
function validateEmployee(data) {
    const errors = {};

    // Required fields
    if (!data.employee_code) errors.employee_code = 'Employee code is required';
    if (!data.first_name) errors.first_name = 'First name is required';
    if (!data.last_name) errors.last_name = 'Last name is required';
    if (!data.email) errors.email = 'Email is required';

    // Format validation
    if (data.employee_code && !VALIDATION_PATTERNS.EMPLOYEE_CODE.test(data.employee_code)) {
        errors.employee_code = 'Invalid employee code format';
    }
    if (data.email && !VALIDATION_PATTERNS.EMAIL.test(data.email)) {
        errors.email = 'Invalid email format';
    }
    if (data.phone && !VALIDATION_PATTERNS.PHONE.test(data.phone)) {
        errors.phone = 'Invalid phone format (e.g., +639123456789)';
    }
    if (data.sss_no && !VALIDATION_PATTERNS.SSS.test(data.sss_no)) {
        errors.sss_no = 'Invalid SSS format (e.g., 12-3456789-0)';
    }
    if (data.philhealth_no && !VALIDATION_PATTERNS.PHILHEALTH.test(data.philhealth_no)) {
        errors.philhealth_no = 'Invalid PhilHealth format (e.g., 12-345678901-2)';
    }
    if (data.pagibig_no && !VALIDATION_PATTERNS.PAGIBIG.test(data.pagibig_no)) {
        errors.pagibig_no = 'Invalid Pag-IBIG format (e.g., 1234-5678-9012)';
    }
    if (data.tin_no && !VALIDATION_PATTERNS.TIN.test(data.tin_no)) {
        errors.tin_no = 'Invalid TIN format (e.g., 123-456-789-000)';
    }

    // Amount validation
    if (data.base_salary && !VALIDATION_PATTERNS.AMOUNT.test(data.base_salary)) {
        errors.base_salary = 'Invalid amount format';
    }
    if (data.hourly_rate && !VALIDATION_PATTERNS.AMOUNT.test(data.hourly_rate)) {
        errors.hourly_rate = 'Invalid amount format';
    }
    if (data.daily_rate && !VALIDATION_PATTERNS.AMOUNT.test(data.daily_rate)) {
        errors.daily_rate = 'Invalid amount format';
    }

    return errors;
}

// Validate attendance data
function validateAttendance(data) {
    const errors = {};

    // Required fields
    if (!data.employee_id) errors.employee_id = 'Employee is required';
    if (!data.work_date) errors.work_date = 'Date is required';
    if (!data.time_in) errors.time_in = 'Time in is required';

    // Format validation
    if (data.work_date && !VALIDATION_PATTERNS.DATE.test(data.work_date)) {
        errors.work_date = 'Invalid date format (YYYY-MM-DD)';
    }
    if (data.time_in && !VALIDATION_PATTERNS.TIME.test(data.time_in)) {
        errors.time_in = 'Invalid time format (HH:MM)';
    }
    if (data.time_out && !VALIDATION_PATTERNS.TIME.test(data.time_out)) {
        errors.time_out = 'Invalid time format (HH:MM)';
    }

    // Time validation
    if (data.time_in && data.time_out) {
        const timeIn = new Date(`${data.work_date} ${data.time_in}`);
        const timeOut = new Date(`${data.work_date} ${data.time_out}`);
        if (timeOut <= timeIn) {
            errors.time_out = 'Time out must be after time in';
        }
    }

    return errors;
}

// Validate payroll data
function validatePayroll(data) {
    const errors = {};

    // Required fields
    if (!data.start_date) errors.start_date = 'Start date is required';
    if (!data.end_date) errors.end_date = 'End date is required';

    // Format validation
    if (data.start_date && !VALIDATION_PATTERNS.DATE.test(data.start_date)) {
        errors.start_date = 'Invalid date format (YYYY-MM-DD)';
    }
    if (data.end_date && !VALIDATION_PATTERNS.DATE.test(data.end_date)) {
        errors.end_date = 'Invalid date format (YYYY-MM-DD)';
    }

    // Date range validation
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (end <= start) {
            errors.end_date = 'End date must be after start date';
        }
    }

    return errors;
}

// Validate leave request
function validateLeave(data) {
    const errors = {};

    // Required fields
    if (!data.employee_id) errors.employee_id = 'Employee is required';
    if (!data.leave_type) errors.leave_type = 'Leave type is required';
    if (!data.start_date) errors.start_date = 'Start date is required';
    if (!data.end_date) errors.end_date = 'End date is required';
    if (!data.reason) errors.reason = 'Reason is required';

    // Format validation
    if (data.start_date && !VALIDATION_PATTERNS.DATE.test(data.start_date)) {
        errors.start_date = 'Invalid date format (YYYY-MM-DD)';
    }
    if (data.end_date && !VALIDATION_PATTERNS.DATE.test(data.end_date)) {
        errors.end_date = 'Invalid date format (YYYY-MM-DD)';
    }

    // Date validation
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (end < start) {
            errors.end_date = 'End date must be after start date';
        }
    }

    return errors;
}

// Session security
const session = {
    // Get session token
    getToken() {
        return localStorage.getItem('token');
    },

    // Set session token
    setToken(token) {
        localStorage.setItem('token', token);
    },

    // Clear session
    clear() {
        localStorage.removeItem('token');
    },

    // Check if session is valid
    isValid() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
};

// Export utilities
export {
    VALIDATION_PATTERNS,
    sanitizeInput,
    validateEmployee,
    validateAttendance,
    validatePayroll,
    validateLeave,
    session
};
