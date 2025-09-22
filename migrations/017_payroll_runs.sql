CREATE TABLE IF NOT EXISTS payroll_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  period_from   TEXT NOT NULL,
  period_to     TEXT NOT NULL,
  total_gross   REAL NOT NULL DEFAULT 0,
  note          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  actor_user_id INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payroll_runs_period ON payroll_runs(period_from, period_to);
CREATE INDEX IF NOT EXISTS ix_payroll_runs_created ON payroll_runs(created_at DESC);


