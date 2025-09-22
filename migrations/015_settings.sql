CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
-- optional defaults
INSERT OR IGNORE INTO settings(key,value) VALUES
 ('company_name','Your Company, Inc.'),
 ('company_address','123 Example St, City, PH'),
 ('company_contact','(02) 555-1234');


