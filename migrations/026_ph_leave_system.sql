-- Philippines-compliant Leave Management System
-- Implements PH labor law leave requirements

-- Leave types table
CREATE TABLE leave_types (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  leave_code            TEXT NOT NULL UNIQUE,
  leave_name            TEXT NOT NULL,
  leave_description     TEXT,
  is_paid               INTEGER DEFAULT 1,
  max_days_per_year     INTEGER,
  requires_approval     INTEGER DEFAULT 1,
  is_ph_law_required    INTEGER DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert PH-compliant leave types
INSERT INTO leave_types (leave_code, leave_name, leave_description, is_paid, max_days_per_year, requires_approval, is_ph_law_required) VALUES
('SIL', 'Service Incentive Leave', '5 days paid leave for employees with at least 1 year of service', 1, 5, 1, 1),
('MATERNITY', 'Maternity Leave', '105 days paid maternity leave for female employees', 1, 105, 1, 1),
('PATERNITY', 'Paternity Leave', '7 days paid paternity leave for male employees', 1, 7, 1, 1),
('SOLO_PARENT', 'Solo Parent Leave', '7 days paid leave for solo parents', 1, 7, 1, 1),
('SICK', 'Sick Leave', 'Unpaid sick leave with medical certificate', 0, NULL, 1, 0),
('VACATION', 'Vacation Leave', 'Paid vacation leave', 1, 15, 1, 0),
('EMERGENCY', 'Emergency Leave', 'Unpaid emergency leave', 0, 5, 1, 0),
('BEREAVEMENT', 'Bereavement Leave', '3 days paid leave for immediate family death', 1, 3, 1, 0),
('BIRTHDAY', 'Birthday Leave', '1 day paid leave on birthday', 1, 1, 0, 0);

-- Employee leave balances
CREATE TABLE employee_leave_balances (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id           INTEGER NOT NULL,
  leave_type_id         INTEGER NOT NULL,
  year                  INTEGER NOT NULL,
  total_entitlement     INTEGER DEFAULT 0,
  used_days             INTEGER DEFAULT 0,
  remaining_days        INTEGER GENERATED ALWAYS AS (total_entitlement - used_days) STORED,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave requests (enhanced from existing requests table)
CREATE TABLE leave_requests (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id           INTEGER NOT NULL,
  leave_type_id         INTEGER NOT NULL,
  start_date            TEXT NOT NULL,
  end_date              TEXT NOT NULL,
  total_days            INTEGER NOT NULL,
  reason                TEXT,
  medical_certificate   TEXT,  -- Path to uploaded medical certificate
  emergency_contact     TEXT,
  status                TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  approver_user_id      INTEGER,
  approval_notes        TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at           TEXT,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY(approver_user_id) REFERENCES users(id)
);

-- Leave request logs
CREATE TABLE leave_request_logs (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  leave_request_id      INTEGER NOT NULL,
  actor_user_id         INTEGER NOT NULL,
  action                TEXT NOT NULL CHECK(action IN ('Submitted', 'Approved', 'Rejected', 'Cancelled', 'Updated')),
  notes                 TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(actor_user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON employee_leave_balances(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_request_logs_request ON leave_request_logs(leave_request_id);

-- Initialize leave balances for existing employees (2024)
INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, total_entitlement)
SELECT 
  e.id,
  lt.id,
  2024,
  CASE 
    WHEN lt.leave_code = 'SIL' THEN 5
    WHEN lt.leave_code = 'VACATION' THEN 15
    WHEN lt.leave_code = 'SICK' THEN 0
    WHEN lt.leave_code = 'EMERGENCY' THEN 5
    WHEN lt.leave_code = 'BEREAVEMENT' THEN 3
    WHEN lt.leave_code = 'BIRTHDAY' THEN 1
    ELSE 0
  END
FROM employees e
CROSS JOIN leave_types lt
WHERE e.status = 'Active' AND lt.leave_code IN ('SIL', 'VACATION', 'SICK', 'EMERGENCY', 'BEREAVEMENT', 'BIRTHDAY');

-- Initialize leave balances for existing employees (2025)
INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, total_entitlement)
SELECT 
  e.id,
  lt.id,
  2025,
  CASE 
    WHEN lt.leave_code = 'SIL' THEN 5
    WHEN lt.leave_code = 'VACATION' THEN 15
    WHEN lt.leave_code = 'SICK' THEN 0
    WHEN lt.leave_code = 'EMERGENCY' THEN 5
    WHEN lt.leave_code = 'BEREAVEMENT' THEN 3
    WHEN lt.leave_code = 'BIRTHDAY' THEN 1
    ELSE 0
  END
FROM employees e
CROSS JOIN leave_types lt
WHERE e.status = 'Active' AND lt.leave_code IN ('SIL', 'VACATION', 'SICK', 'EMERGENCY', 'BEREAVEMENT', 'BIRTHDAY');
