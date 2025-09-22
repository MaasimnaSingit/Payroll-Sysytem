-- Prevent INSERT/UPDATE/DELETE on attendance if date falls within a Paid period.
CREATE TRIGGER IF NOT EXISTS trg_attendance_lock_ins
BEFORE INSERT ON attendance
FOR EACH ROW
WHEN EXISTS (
  SELECT 1 FROM payroll_runs
  WHERE NEW.work_date BETWEEN period_from AND period_to
)
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_LOCKED_PAID_PERIOD');
END;

CREATE TRIGGER IF NOT EXISTS trg_attendance_lock_upd
BEFORE UPDATE ON attendance
FOR EACH ROW
WHEN EXISTS (
  SELECT 1 FROM payroll_runs
  WHERE COALESCE(NEW.work_date, OLD.work_date)
        BETWEEN period_from AND period_to
)
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_LOCKED_PAID_PERIOD');
END;

CREATE TRIGGER IF NOT EXISTS trg_attendance_lock_del
BEFORE DELETE ON attendance
FOR EACH ROW
WHEN EXISTS (
  SELECT 1 FROM payroll_runs
  WHERE OLD.work_date BETWEEN period_from AND period_to
)
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_LOCKED_PAID_PERIOD');
END;


