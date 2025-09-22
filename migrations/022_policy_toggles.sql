-- Portal policy settings (defaults)
INSERT OR IGNORE INTO settings(key,value) VALUES
 ('require_photo_in','1'),
 ('require_photo_out','1'),
 ('require_geo','0'),
 ('punch_cooldown_seconds','60'),
 ('allow_cross_midnight','0'),
 ('max_shift_hours_soft','16');


