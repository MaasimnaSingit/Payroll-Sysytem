// Validation service for TGPS Payroll System

class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

// Employee validation
const employeeValidation = {
    // Validate employee code format (e.g., EMP001)
    employeeCode: (code) => {
        if (!code) throw new ValidationError('Employee code is required', 'employee_code');
        if (!/^[A-Z]{3}\d{3,}$/.test(code)) {
            throw new ValidationError('Invalid employee code format (e.g., EMP001)', 'employee_code');
        }
    },

    // Validate name fields
    name: (first, last) => {
        if (!first) throw new ValidationError('First name is required', 'first_name');
        if (!last) throw new ValidationError('Last name is required', 'last_name');
        if (first.length < 2) throw new ValidationError('First name too short', 'first_name');
        if (last.length < 2) throw new ValidationError('Last name too short', 'last_name');
    },

    // Validate email format
    email: (email) => {
        if (!email) throw new ValidationError('Email is required', 'email');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ValidationError('Invalid email format', 'email');
        }
    },

    // Validate phone format (PH)
    phone: (phone) => {
        if (phone && !/^\+?63[0-9]{10}$/.test(phone.replace(/[\s-]/g, ''))) {
            throw new ValidationError('Invalid phone format (+63 XXX XXX XXXX)', 'phone');
        }
    },

    // Validate government IDs
    governmentIds: {
        sss: (no) => {
            if (no && !/^\d{2}-\d{7}-\d$/.test(no)) {
                throw new ValidationError('Invalid SSS format (XX-XXXXXXX-X)', 'sss_no');
            }
        },
        philhealth: (no) => {
            if (no && !/^\d{2}-\d{9}-\d$/.test(no)) {
                throw new ValidationError('Invalid PhilHealth format (XX-XXXXXXXXX-X)', 'philhealth_no');
            }
        },
        pagibig: (no) => {
            if (no && !/^\d{4}-\d{4}-\d{4}$/.test(no)) {
                throw new ValidationError('Invalid Pag-IBIG format (XXXX-XXXX-XXXX)', 'pagibig_no');
            }
        },
        tin: (no) => {
            if (no && !/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(no)) {
                throw new ValidationError('Invalid TIN format (XXX-XXX-XXX-XXX)', 'tin_no');
            }
        }
    },

    // Validate rates and salary
    compensation: (base, hourly, daily) => {
        if (base < 0) throw new ValidationError('Base salary cannot be negative', 'base_salary');
        if (hourly < 0) throw new ValidationError('Hourly rate cannot be negative', 'hourly_rate');
        if (daily < 0) throw new ValidationError('Daily rate cannot be negative', 'daily_rate');
        
        // Verify rates match
        const computedDaily = hourly * 8;
        if (Math.abs(computedDaily - daily) > 0.01) {
            throw new ValidationError('Daily rate should be 8x hourly rate', 'daily_rate');
        }
    },

    // Validate complete employee record
    validateEmployee: (data) => {
        employeeValidation.employeeCode(data.employee_code);
        employeeValidation.name(data.first_name, data.last_name);
        employeeValidation.email(data.email);
        employeeValidation.phone(data.phone);
        employeeValidation.governmentIds.sss(data.sss_no);
        employeeValidation.governmentIds.philhealth(data.philhealth_no);
        employeeValidation.governmentIds.pagibig(data.pagibig_no);
        employeeValidation.governmentIds.tin(data.tin_no);
        employeeValidation.compensation(
            Number(data.base_salary) || 0,
            Number(data.hourly_rate) || 0,
            Number(data.daily_rate) || 0
        );
    }
};

// Attendance validation
const attendanceValidation = {
    // Validate time format and logic
    time: (timeIn, timeOut, workDate) => {
        if (!timeIn) throw new ValidationError('Time in is required', 'time_in');
        
        if (timeOut) {
            const inTime = new Date(`${workDate} ${timeIn}`);
            const outTime = new Date(`${workDate} ${timeOut}`);
            if (outTime <= inTime) {
                throw new ValidationError('Time out must be after time in', 'time_out');
            }
        }
    },

    // Validate break minutes
    breakMinutes: (minutes) => {
        if (minutes < 0) throw new ValidationError('Break minutes cannot be negative', 'break_minutes');
        if (minutes > 480) throw new ValidationError('Break cannot exceed 8 hours', 'break_minutes');
    },

    // Validate overtime hours
    overtime: (hours) => {
        if (hours < 0) throw new ValidationError('Overtime hours cannot be negative', 'manual_overtime_hours');
        if (hours > 16) throw new ValidationError('Overtime cannot exceed 16 hours', 'manual_overtime_hours');
    },

    // Validate photos
    photos: (photoIn, photoOut, timeIn, timeOut) => {
        if (timeIn && !photoIn) throw new ValidationError('Photo required for clock in', 'photo_in');
        if (timeOut && !photoOut) throw new ValidationError('Photo required for clock out', 'photo_out');
    },

    // Validate complete attendance record
    validateAttendance: (data) => {
        if (!data.employee_id) throw new ValidationError('Employee is required', 'employee_id');
        if (!data.work_date) throw new ValidationError('Work date is required', 'work_date');
        
        attendanceValidation.time(data.time_in, data.time_out, data.work_date);
        attendanceValidation.breakMinutes(Number(data.break_minutes) || 0);
        attendanceValidation.overtime(Number(data.manual_overtime_hours) || 0);
        attendanceValidation.photos(data.photo_in, data.photo_out, data.time_in, data.time_out);
    }
};

// Payroll validation
const payrollValidation = {
    // Validate period dates
    period: (start, end) => {
        if (!start) throw new ValidationError('Start date is required', 'period_start');
        if (!end) throw new ValidationError('End date is required', 'period_end');
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (endDate <= startDate) {
            throw new ValidationError('End date must be after start date', 'period_end');
        }
        
        // Period should not exceed 31 days
        const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (days > 31) {
            throw new ValidationError('Payroll period cannot exceed 31 days', 'period_end');
        }
    },

    // Validate hours
    hours: (regular, overtime, nightDiff) => {
        if (regular < 0) throw new ValidationError('Regular hours cannot be negative', 'regular_hours');
        if (overtime < 0) throw new ValidationError('Overtime hours cannot be negative', 'overtime_hours');
        if (nightDiff < 0) throw new ValidationError('Night differential hours cannot be negative', 'night_diff_hours');
        
        // Total hours per day cannot exceed 24
        const totalHours = regular + overtime + nightDiff;
        const days = Math.ceil(regular / 8);
        if (totalHours / days > 24) {
            throw new ValidationError('Total hours per day cannot exceed 24', 'overtime_hours');
        }
    },

    // Validate complete payroll record
    validatePayroll: (data) => {
        payrollValidation.period(data.period_start, data.period_end);
        payrollValidation.hours(
            Number(data.regular_hours) || 0,
            Number(data.overtime_hours) || 0,
            Number(data.night_diff_hours) || 0
        );
    }
};

module.exports = {
    ValidationError,
    employeeValidation,
    attendanceValidation,
    payrollValidation
};
