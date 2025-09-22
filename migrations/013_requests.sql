-- Employee Requests + Audit logs
CREATE TABLE IF NOT EXISTS requests (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id      INTEGER NOT NULL,
  type             TEXT NOT NULL CHECK(type IN ('TimeCorrection','Overtime','Leave')),
  work_date        TEXT,
  date_from        TEXT,
  date_to          TEXT,
  time_in          TEXT,
  time_out         TEXT,
  break_minutes    INTEGER DEFAULT 0,
  ot_hours         REAL,
  is_paid          INTEGER DEFAULT 0,
  reason           TEXT,
  attachment_path  TEXT,
  status           TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected','Cancelled')),
  approver_user_id INTEGER,
  decision_note    TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at       TEXT,
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_requests_status_type_created
  ON requests(status, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_employee_created
  ON requests(employee_id, created_at DESC);

CREATE TABLE IF NOT EXISTS request_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id  INTEGER NOT NULL,
  actor_user_id INTEGER NOT NULL,
  action      TEXT NOT NULL CHECK(action IN ('Submitted','Approved','Rejected','Cancelled','Updated')),
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(request_id) REFERENCES requests(id)
);


