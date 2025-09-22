// Admin-settable payroll settings (localStorage-backed for the demo)
const KEY = 'payroll_settings_v1';
// otMultiplier kept for fallback only (when employee OT/hr missing).
const DEFAULTS = {
  regularDailyHours: 8,
  holidayMultiplier: 1,
  restDayMultiplier: 1,
  useHolidayMultiplier: true,
  useRestDayMultiplier: true,
  otMultiplier: 1.25
};

export function getSettings() {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; }
  catch { return { ...DEFAULTS }; }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...(patch || {}) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function dayMultiplierFor(dayType) {
  const s = getSettings();
  if (dayType === 'Holiday') {
    if (s.useHolidayMultiplier === false) return 1;
    return Number(s.holidayMultiplier) || 1;
  }
  // Support both labels (old “Rest day” and new “Rest day duty”)
  if (dayType === 'Rest day' || dayType === 'Rest day duty') {
    if (s.useRestDayMultiplier === false) return 1;
    return Number(s.restDayMultiplier) || 1;
  }
  return 1;
}


