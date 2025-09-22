-- Philippines-compliant Employee Management
-- Enhanced employees table with PH-specific fields

-- Drop existing employees table if it exists and recreate with PH fields
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code         TEXT NOT NULL UNIQUE,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  middle_name           TEXT,
  email                 TEXT NOT NULL UNIQUE,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  province              TEXT,
  postal_code           TEXT,
  birth_date            TEXT,
  gender                TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
  civil_status          TEXT CHECK(civil_status IN ('Single', 'Married', 'Widowed', 'Divorced', 'Separated')),
  
  -- Employment Information
  employment_type       TEXT NOT NULL CHECK(employment_type IN ('Regular', 'Probationary', 'Contractual', 'Part-time', 'Daily')),
  department            TEXT,
  position              TEXT,
  job_title             TEXT,
  hire_date             TEXT NOT NULL,
  probation_end_date    TEXT,
  contract_end_date     TEXT,
  
  -- Compensation (Philippine Peso)
  basic_salary          REAL DEFAULT 0,  -- Monthly salary for regular employees
  daily_rate            REAL DEFAULT 0,  -- Daily rate for daily employees
  hourly_rate           REAL DEFAULT 0,  -- Hourly rate for part-time employees
  overtime_rate         REAL DEFAULT 0,  -- Overtime rate (usually 1.25x hourly)
  night_differential    REAL DEFAULT 0,  -- Night differential rate (usually 0.10x)
  
  -- Government IDs (Philippines)
  sss_number            TEXT,
  philhealth_number     TEXT,
  pagibig_number        TEXT,
  tin_number            TEXT,
  
  -- Bank Information
  bank_name             TEXT,
  bank_account_number   TEXT,
  bank_account_name     TEXT,
  
  -- Emergency Contact
  emergency_contact_name    TEXT,
  emergency_contact_phone   TEXT,
  emergency_contact_relation TEXT,
  
  -- Status and Dates
  status                TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Terminated', 'Resigned')),
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Computed fields for display
  full_name             TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

-- Insert sample PH employees
INSERT INTO employees (
  employee_code, first_name, last_name, middle_name, email, phone, address, city, province,
  employment_type, department, position, hire_date, basic_salary, daily_rate, hourly_rate,
  sss_number, philhealth_number, pagibig_number, tin_number
) VALUES 
('EMP001', 'Juan', 'Dela Cruz', 'Santos', 'juan.delacruz@company.com', '+63-912-345-6789', '123 Rizal Street', 'Manila', 'NCR', 'Regular', 'IT', 'Software Developer', '2023-01-15', 25000.00, 0, 0, '03-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789-000'),
('EMP002', 'Maria', 'Santos', 'Garcia', 'maria.santos@company.com', '+63-917-234-5678', '456 EDSA', 'Quezon City', 'NCR', 'Regular', 'HR', 'HR Manager', '2022-06-01', 35000.00, 0, 0, '03-2345678-9', '12-456789012-3', '2345-6789-0123', '234-567-890-000'),
('EMP003', 'Pedro', 'Cruz', 'Lopez', 'pedro.cruz@company.com', '+63-918-345-6789', '789 Ayala Avenue', 'Makati', 'NCR', 'Probationary', 'Sales', 'Sales Representative', '2024-01-02', 20000.00, 0, 0, '03-3456789-0', '12-567890123-4', '3456-7890-1234', '345-678-901-000'),
('EMP004', 'Ana', 'Reyes', 'Martinez', 'ana.reyes@company.com', '+63-919-456-7890', '321 Ortigas Center', 'Pasig', 'NCR', 'Part-time', 'Customer Service', 'CS Representative', '2023-09-01', 0, 0, 150.00, '03-4567890-1', '12-678901234-5', '4567-8901-2345', '456-789-012-000'),
('EMP005', 'Jose', 'Gonzales', 'Fernandez', 'jose.gonzales@company.com', '+63-920-567-8901', '654 Commonwealth Ave', 'Quezon City', 'NCR', 'Daily', 'Maintenance', 'Maintenance Worker', '2023-03-15', 0, 800.00, 0, '03-5678901-2', '12-789012345-6', '5678-9012-3456', '567-890-123-000');
