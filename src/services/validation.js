// src/services/validation.js

// Format field value utility
export function formatFieldValue(value, type = 'text') {
    if (value === null || value === undefined) {
        return '';
    }
    
    if (type === 'string' || type === 'text') {
        return String(value).trim();
    }
    
    if (type === 'number') {
        const num = Number(value);
        return isNaN(num) ? '' : num;
    }
    
    if (type === 'email') {
        return String(value).trim().toLowerCase();
    }
    
    if (type === 'phone') {
        return String(value).trim();
    }
    
    return String(value).trim();
}

// Validate employee data
export function employeeValidation(data) {
    const errors = {};

    const required = [
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'employment_type',
        'base_salary',
        'date_hired'
    ];

    for (const field of required) {
        if (!data[field]) {
            errors[field] = 'Required';
        }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email format';
    }

    if (data.phone && !/^\+63 \d{3} \d{3} \d{4}$/.test(data.phone)) {
        errors.phone = 'Invalid phone format (+63 XXX XXX XXXX)';
    }

    if (data.base_salary && data.base_salary <= 0) {
        errors.base_salary = 'Must be greater than 0';
    }

    if (data.sss_no && !/^\d{2}-\d{7}-\d{1}$/.test(data.sss_no)) {
        errors.sss_no = 'Invalid SSS format (XX-XXXXXXX-X)';
    }

    if (data.philhealth_no && !/^\d{2}-\d{9}-\d{1}$/.test(data.philhealth_no)) {
        errors.philhealth_no = 'Invalid PhilHealth format (XX-XXXXXXXXX-X)';
    }

    if (data.pagibig_no && !/^\d{4}-\d{4}-\d{4}$/.test(data.pagibig_no)) {
        errors.pagibig_no = 'Invalid Pag-IBIG format (XXXX-XXXX-XXXX)';
    }

    if (data.tin_no && !/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(data.tin_no)) {
        errors.tin_no = 'Invalid TIN format (XXX-XXX-XXX-XXX)';
    }

    return errors;
}

// Validate attendance data
export function validateAttendance(data, isUpdate = false) {
    const errors = {};

    if (!isUpdate) {
        if (!data.employee_id) errors.employee_id = 'Required';
        if (!data.work_date) errors.work_date = 'Required';
        if (!data.time_in) errors.time_in = 'Required';
        if (!data.photo_in) errors.photo_in = 'Photo required for clock in';
    }

    if (isUpdate && data.time_out && !data.photo_out) {
        errors.photo_out = 'Photo required for clock out';
    }

    if (data.time_in && data.time_out) {
        const timeIn = new Date(`2000-01-01 ${data.time_in}`);
        let timeOut = new Date(`2000-01-01 ${data.time_out}`);

        if (timeOut <= timeIn) {
            timeOut = new Date(`2000-01-02 ${data.time_out}`);
        }
    }

    if (data.break_minutes && data.break_minutes < 0) {
        errors.break_minutes = 'Must be 0 or greater';
    }

    if (data.manual_overtime_hours && data.manual_overtime_hours < 0) {
        errors.manual_overtime_hours = 'Must be 0 or greater';
    }

    return errors;
}

// Calculate night differential hours
export function calculateNightDiff(timeIn, timeOut, workDate, breakMinutes = 0) {
    if (!timeIn || !timeOut) return 0;

    const startDate = new Date(`${workDate} ${timeIn}`);
    let endDate = new Date(`${workDate} ${timeOut}`);

    if (endDate <= startDate) {
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    }

    const nightStartHour = 22; 
    const nightEndHour = 6;    

    let nightDiffHours = 0;
    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
        const hour = currentTime.getHours();
        if (hour >= nightStartHour || hour < nightEndHour) {
            const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000);
            if (nextHour > endDate) {
                const minutes = (endDate - currentTime) / (60 * 1000);
                nightDiffHours += minutes / 60;
            } else {
                nightDiffHours++;
            }
        }
        currentTime.setTime(currentTime.getTime() + 60 * 60 * 1000);
    }

    if (breakMinutes > 0) {
        const totalHours = (endDate - startDate) / (60 * 60 * 1000);
        const breakHours = breakMinutes / 60;
        const nightDiffRatio = nightDiffHours / totalHours;
        nightDiffHours -= breakHours * nightDiffRatio;
    }

    return Math.round(nightDiffHours * 100) / 100;
}

// Calculate regular hours
export function calculateRegularHours(timeIn, timeOut, breakMinutes = 0) {
    if (!timeIn || !timeOut) return 0;

    const startTime = new Date(`2000-01-01 ${timeIn}`);
    let endTime = new Date(`2000-01-01 ${timeOut}`);

    if (endTime <= startTime) {
        endTime = new Date(`2000-01-02 ${timeOut}`);
    }

    const hours = (endTime - startTime) / (60 * 60 * 1000);
    return Math.round((hours - (breakMinutes / 60)) * 100) / 100;
}

// Validate leave request
export function validateLeaveRequest(data) {
    const errors = {};

    const required = [
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'reason'
    ];

    for (const field of required) {
        if (!data[field]) {
            errors[field] = 'Required';
        }
    }

    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (end < start) {
            errors.end_date = 'End date must be after start date';
        }
    }

    return errors;
}

