export const DAILY_TO_OT = {
  520: 72,
  570: 79,
  600: 83,
  620: 85,
  800: 110,
};

// Try to auto-derive OT/hr from an hourly rate by matching the daily pay tier.
export function autoOtFromHourly(hourly) {
  const h = Number(hourly) || 0;
  const daily = Math.round(h * 8 * 100) / 100; // keep cents
  const keys = Object.keys(DAILY_TO_OT).map(Number);
  for (const k of keys) {
    if (Math.abs(daily - k) < 0.01) return DAILY_TO_OT[k];
  }
  return null;
}


