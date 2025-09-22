-- TGPS Payroll System Database Schema

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    employee_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT OR IGNORE INTO users (username, password, role)
VALUES (
    'admin',
    '$2a$10$TVq1uKGCpA47ttzN5UKc3u/.MtzCvopST5KWDQt0xzjt4hwVls8Om',
    'admin'
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    birth_date TEXT,
    gender TEXT,
    civil_status TEXT,
    employment_type TEXT NOT NULL DEFAULT 'Regular',
    department TEXT,
    position TEXT,
    job_title TEXT,
    base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    sss_no TEXT CHECK (sss_no IS NULL OR length(sss_no) = 12),
    philhealth_no TEXT CHECK (philhealth_no IS NULL OR length(philhealth_no) = 14),
    pagibig_no TEXT CHECK (pagibig_no IS NULL OR length(pagibig_no) = 14),
    tin_no TEXT CHECK (tin_no IS NULL OR length(tin_no) = 15),
    date_hired TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    work_date TEXT NOT NULL,
    time_in TEXT NOT NULL,
    time_out TEXT,
    break_minutes INTEGER DEFAULT 0,
    day_type TEXT NOT NULL DEFAULT 'Regular',
    hours_worked DECIMAL(5,2) DEFAULT 0,
    regular_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    night_differential_hours DECIMAL(5,2) DEFAULT 0,
    regular_pay DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    night_differential_pay DECIMAL(10,2) DEFAULT 0,
    holiday_pay DECIMAL(10,2) DEFAULT 0,
    rest_day_pay DECIMAL(10,2) DEFAULT 0,
    total_daily_pay DECIMAL(10,2) DEFAULT 0,
    manual_overtime_hours DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    is_holiday BOOLEAN DEFAULT 0,
    holiday_type TEXT,
    photo_in TEXT,
    photo_out TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    CHECK (break_minutes >= 0),
    CHECK (manual_overtime_hours >= 0),
    CHECK (night_differential_hours >= 0)
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    regular_hours DECIMAL(7,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(7,2) NOT NULL DEFAULT 0,
    night_diff_hours DECIMAL(7,2) NOT NULL DEFAULT 0,
    basic_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    night_diff_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    holiday_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    sss_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    philhealth_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    pagibig_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    bir_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    CHECK (regular_hours >= 0),
    CHECK (overtime_hours >= 0),
    CHECK (night_diff_hours >= 0),
    CHECK (basic_pay >= 0),
    CHECK (overtime_pay >= 0),
    CHECK (night_diff_pay >= 0),
    CHECK (holiday_pay >= 0),
    CHECK (sss_contribution >= 0),
    CHECK (philhealth_contribution >= 0),
    CHECK (pagibig_contribution >= 0),
    CHECK (bir_tax >= 0),
    CHECK (gross_pay >= 0)
);

-- Leave Types table
CREATE TABLE IF NOT EXISTS leave_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    days INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default leave types
INSERT OR IGNORE INTO leave_types (id, name, description, days) VALUES
('VL', 'Vacation Leave', 'Annual vacation leave', 15),
('SL', 'Sick Leave', 'Medical leave with pay', 15),
('SIL', 'Service Incentive Leave', 'After 1 year of service', 5),
('ML', 'Maternity Leave', '105 days with full pay', 105),
('PL', 'Paternity Leave', '7 days with full pay', 7),
('SPL', 'Solo Parent Leave', '7 days with full pay', 7),
('BL', 'Bereavement Leave', '3 days with full pay', 3),
('EL', 'Emergency Leave', 'For urgent personal matters', 3);

-- Leave Balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    remaining_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type) REFERENCES leave_types(id),
    UNIQUE(employee_id, leave_type, year),
    CHECK (total_days >= 0),
    CHECK (used_days >= 0),
    CHECK (remaining_days >= 0)
);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type) REFERENCES leave_types(id),
    CHECK (days > 0),
    CHECK (end_date >= start_date),
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS employees_updated_at 
AFTER UPDATE ON employees
BEGIN
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS attendance_updated_at 
AFTER UPDATE ON attendance
BEGIN
    UPDATE attendance SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS leave_balances_updated_at 
AFTER UPDATE ON leave_balances
BEGIN
    UPDATE leave_balances SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS leave_requests_updated_at 
AFTER UPDATE ON leave_requests
BEGIN
    UPDATE leave_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- SSS Contributions table (2024 rates)
CREATE TABLE IF NOT EXISTS sss_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    range_start DECIMAL(10,2) NOT NULL,
    range_end DECIMAL(10,2) NOT NULL,
    employee_contribution DECIMAL(10,2) NOT NULL,
    employer_contribution DECIMAL(10,2) NOT NULL,
    effective_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PhilHealth Contributions table (2024 rates)
CREATE TABLE IF NOT EXISTS philhealth_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    range_start DECIMAL(10,2) NOT NULL,
    range_end DECIMAL(10,2) NOT NULL,
    employee_contribution DECIMAL(10,2) NOT NULL,
    employer_contribution DECIMAL(10,2) NOT NULL,
    effective_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pag-IBIG Contributions table (2024 rates)
CREATE TABLE IF NOT EXISTS pagibig_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    range_start DECIMAL(10,2) NOT NULL,
    range_end DECIMAL(10,2) NOT NULL,
    employee_contribution DECIMAL(10,2) NOT NULL,
    employer_contribution DECIMAL(10,2) NOT NULL,
    effective_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BIR Tax Brackets table (2024 rates)
CREATE TABLE IF NOT EXISTS bir_tax_brackets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    range_start DECIMAL(10,2) NOT NULL,
    range_end DECIMAL(10,2) NOT NULL,
    base_tax DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    effective_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Philippine Holidays table
CREATE TABLE IF NOT EXISTS ph_holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    holiday_name TEXT NOT NULL,
    holiday_date TEXT NOT NULL,
    holiday_type TEXT NOT NULL CHECK (holiday_type IN ('Regular', 'Special Non-Working', 'Special Working')),
    is_recurring BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_type ON leave_balances(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type ON leave_requests(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Insert default admin user (password: Tgpspayroll16**)
INSERT OR IGNORE INTO users (username, password, role, created_at) VALUES 
('Tgpspayroll', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', CURRENT_TIMESTAMP);