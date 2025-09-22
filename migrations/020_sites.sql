CREATE TABLE IF NOT EXISTS sites (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  radius_m    INTEGER NOT NULL DEFAULT 150
);

ALTER TABLE employees ADD COLUMN site_id INTEGER REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS ix_employees_site ON employees(site_id);


