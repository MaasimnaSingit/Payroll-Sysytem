-- Users table for admin + employee portal
CREATE TABLE IF NOT EXISTS users (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  username                TEXT NOT NULL UNIQUE,
  password_hash           TEXT NOT NULL,
  role                    TEXT NOT NULL CHECK(role IN ('ADMIN_HR','EMPLOYEE')),
  employee_id             INTEGER,
  status                  TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Inactive')),
  must_change_password    INTEGER NOT NULL DEFAULT 1,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee_unique
  ON users(employee_id) WHERE role='EMPLOYEE' AND employee_id IS NOT NULL;


