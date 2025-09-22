// LocalStorage-backed per-period deductions
// Shape in storage:
// { "p:2025-08-01|2025-08-15": { "<employee_id>": 250.00, ... }, ... }
const KEY = 'deductions_v1';

function _all() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function _saveAll(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}
export function periodKey(start, end) {
  return `p:${start || ''}|${end || ''}`;
}
export function loadDeductions(start, end) {
  const map = _all();
  return map[periodKey(start, end)] || {};
}
export function saveDeduction(start, end, employeeId, amount) {
  const all = _all();
  const key = periodKey(start, end);
  const cur = all[key] || {};
  cur[employeeId] = Number.isFinite(amount) ? Number(amount) : 0;
  all[key] = cur;
  _saveAll(all);
  return cur;
}
export function clearDeductions(start, end) {
  const all = _all();
  const key = periodKey(start, end);
  delete all[key];
  _saveAll(all);
  return {};
}


