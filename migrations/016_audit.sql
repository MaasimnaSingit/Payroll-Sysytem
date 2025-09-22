CREATE TABLE IF NOT EXISTS audit_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  actor_user_id   INTEGER,
  actor_role      TEXT,
  type            TEXT NOT NULL,
  action          TEXT NOT NULL,
  entity          TEXT,
  entity_id       TEXT,
  message         TEXT,
  before_json     TEXT,
  after_json      TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_type_action ON audit_events(type, action);


