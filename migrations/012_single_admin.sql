-- Enforce single ADMIN_HR account
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin_only_one
  ON users(role) WHERE role='ADMIN_HR';


