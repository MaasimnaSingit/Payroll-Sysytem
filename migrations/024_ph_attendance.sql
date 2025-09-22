-- Philippines-compliant Attendance System
-- Enhanced attendance table with PH-specific calculations

-- Drop existing attendance table if it exists and recreate with PH fields
DROP TABLE IF EXISTS attendance;

CREATE TABLE attendance (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id           INTEGER NOT NULL,
  work_date             TEXT NOT NULL,
  time_in               TEXT,
  time_out              TEXT,
  break_minutes         INTEGER DEFAULT 0,
  
  -- Philippines-specific fields
  day_type              TEXT NOT NULL DEFAULT 'Regular' CHECK(day_type IN ('Regular', 'Rest Day', 'Holiday', 'Special Non-Working Day')),
  is_holiday            INTEGER DEFAULT 0,
  holiday_type          TEXT CHECK(holiday_type IN ('Regular Holiday', 'Special Non-Working Day', 'Local Holiday')),
  
  -- Time calculations (PH labor law compliant)
  hours_worked          REAL DEFAULT 0,
  regular_hours         REAL DEFAULT 0,
  overtime_hours        REAL DEFAULT 0,
  night_differential_hours REAL DEFAULT 0,  -- 10PM-6AM
  rest_day_hours        REAL DEFAULT 0,
  holiday_hours         REAL DEFAULT 0,
  
  -- Pay calculations (Philippine Peso)
  regular_pay           REAL DEFAULT 0,
  overtime_pay          REAL DEFAULT 0,
  night_differential_pay REAL DEFAULT 0,
  rest_day_pay          REAL DEFAULT 0,
  holiday_pay           REAL DEFAULT 0,
  total_daily_pay       REAL DEFAULT 0,
  
  -- Photo proof
  time_in_photo         TEXT,
  time_out_photo        TEXT,
  
  -- Manual overrides
  manual_overtime_hours REAL DEFAULT 0,
  notes                 TEXT,
  
  -- Status and audit
  status                TEXT NOT NULL DEFAULT 'Present' CHECK(status IN ('Present', 'Absent', 'Late', 'Half Day', 'Excused')),
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_day_type ON attendance(day_type);

-- Philippines Holidays table
CREATE TABLE ph_holidays (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  holiday_name          TEXT NOT NULL,
  holiday_date          TEXT NOT NULL,
  holiday_type          TEXT NOT NULL CHECK(holiday_type IN ('Regular Holiday', 'Special Non-Working Day', 'Local Holiday')),
  is_recurring          INTEGER DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert 2024 Philippines holidays
INSERT INTO ph_holidays (holiday_name, holiday_date, holiday_type, is_recurring) VALUES
('New Year''s Day', '2024-01-01', 'Regular Holiday', 1),
('Maundy Thursday', '2024-03-28', 'Regular Holiday', 0),
('Good Friday', '2024-03-29', 'Regular Holiday', 0),
('Araw ng Kagitingan', '2024-04-09', 'Regular Holiday', 1),
('Labor Day', '2024-05-01', 'Regular Holiday', 1),
('Independence Day', '2024-06-12', 'Regular Holiday', 1),
('National Heroes Day', '2024-08-26', 'Regular Holiday', 1),
('Bonifacio Day', '2024-11-30', 'Regular Holiday', 1),
('Rizal Day', '2024-12-30', 'Regular Holiday', 1),
('Christmas Day', '2024-12-25', 'Regular Holiday', 1),
('Black Saturday', '2024-03-30', 'Special Non-Working Day', 0),
('Ninoy Aquino Day', '2024-08-21', 'Special Non-Working Day', 1),
('All Saints Day', '2024-11-01', 'Special Non-Working Day', 1),
('All Souls Day', '2024-11-02', 'Special Non-Working Day', 1),
('New Year''s Eve', '2024-12-31', 'Special Non-Working Day', 1);

-- Insert 2025 Philippines holidays
INSERT INTO ph_holidays (holiday_name, holiday_date, holiday_type, is_recurring) VALUES
('New Year''s Day', '2025-01-01', 'Regular Holiday', 1),
('Maundy Thursday', '2025-04-17', 'Regular Holiday', 0),
('Good Friday', '2025-04-18', 'Regular Holiday', 0),
('Araw ng Kagitingan', '2025-04-09', 'Regular Holiday', 1),
('Labor Day', '2025-05-01', 'Regular Holiday', 1),
('Independence Day', '2025-06-12', 'Regular Holiday', 1),
('National Heroes Day', '2025-08-25', 'Regular Holiday', 1),
('Bonifacio Day', '2025-11-30', 'Regular Holiday', 1),
('Rizal Day', '2025-12-30', 'Regular Holiday', 1),
('Christmas Day', '2025-12-25', 'Regular Holiday', 1),
('Black Saturday', '2025-04-19', 'Special Non-Working Day', 0),
('Ninoy Aquino Day', '2025-08-21', 'Special Non-Working Day', 1),
('All Saints Day', '2025-11-01', 'Special Non-Working Day', 1),
('All Souls Day', '2025-11-02', 'Special Non-Working Day', 1),
('New Year''s Eve', '2025-12-31', 'Special Non-Working Day', 1);
