-- Attendance lookups
CREATE INDEX IF NOT EXISTS ix_attendance_date ON attendance(work_date);
CREATE INDEX IF NOT EXISTS ix_attendance_emp_date ON attendance(employee_id, work_date);

-- Requests moderation
CREATE INDEX IF NOT EXISTS ix_requests_status ON requests(status);

-- Employees quick search
CREATE UNIQUE INDEX IF NOT EXISTS ux_employees_code ON employees(employee_code);


