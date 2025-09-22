-- policy metrics (do not change pay math)
ALTER TABLE attendance ADD COLUMN late_minutes INTEGER DEFAULT 0;
ALTER TABLE attendance ADD COLUMN early_out_minutes INTEGER DEFAULT 0;
ALTER TABLE attendance ADD COLUMN in_distance_m REAL;
ALTER TABLE attendance ADD COLUMN out_distance_m REAL;
ALTER TABLE attendance ADD COLUMN in_in_range INTEGER;
ALTER TABLE attendance ADD COLUMN out_in_range INTEGER;

-- sensible defaults for workday start/end, grace, rounding
INSERT OR IGNORE INTO settings(key,value) VALUES
 ('workday_start','09:00'),
 ('workday_end','18:00'),
 ('grace_minutes','10'),
 ('rounding_minutes','5');


