// Tiny localStorage-backed store for demo/dev (hourly-only).
// Employee:  { id, employee_code, name, email, department, base_rate, ot_rate?, hire_date, status, created_at, updated_at }
// Attendance:{ id, employee_id, work_date, time_in, time_out, break_minutes, day_type, ot_override?, status, notes,
//              hours_worked, regular_hours, overtime_hours, daily_pay, created_at, updated_at }

const EMP_KEY = 'employees_v1';
const ATT_KEY = 'attendance_v1';
const MAP_KEY = 'user_employee_map_v1';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// time helpers
function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}
import { getSettings, dayMultiplierFor } from './settings.js';
import { autoOtFromHourly } from './otTable.js';
export function computeHoursPay({ base_rate, ot_rate, employment_type = 'Hourly', day_type = 'Regular', time_in, time_out, break_minutes = 0, ot_override }) {
  const start = toMinutes(time_in);
  let end = toMinutes(time_out);
  if (start == null || end == null) return { hours_worked: 0, regular_hours: 0, overtime_hours: 0, daily_pay: 0 };
  // support overnight: if end <= start, treat as next day
  if (end <= start) end += 24 * 60;
  const workedMin = Math.max(0, end - start - (Number(break_minutes) || 0));
  const hoursWorked = workedMin / 60;
  const { otMultiplier } = getSettings(); // kept only as fallback for ot_rate if missing
  const mult = dayMultiplierFor(day_type);
  const hourly = Number(base_rate) || 0;
  // Manual-only OT: use ot_override if provided, else 0
  const manualOT = Number(ot_override);
  const overtimeHours = Number.isFinite(manualOT) && manualOT > 0 ? Math.min(manualOT, hoursWorked) : 0;
  const regularHours = Math.max(0, hoursWorked - overtimeHours);
  const tableOT = autoOtFromHourly(hourly);
  const otPerHour = Number(ot_rate) || tableOT || (hourly * (Number(otMultiplier) || 1.25));
  // Calculate daily pay based on employment type
  let dailyPay = 0;
  if (employment_type === 'Hourly') {
    // Hourly: regular hours * hourly rate + overtime hours * OT rate
    dailyPay = round2(mult * (regularHours * hourly + overtimeHours * otPerHour));
  } else if (employment_type === 'Daily') {
    // Daily: fixed daily rate regardless of hours worked
    dailyPay = round2(mult * hourly);
  } else if (employment_type === 'Monthly') {
    // Monthly: 0 for daily pay calculation (monthly salary is handled separately)
    dailyPay = 0;
  }
  
  return {
    hours_worked: round2(hoursWorked),
    regular_hours: round2(regularHours),
    overtime_hours: round2(overtimeHours),
    daily_pay: dailyPay
  };
}

// EMPLOYEES
export const employeesStore = {
  list() { return read(EMP_KEY); },
  get(id) { return this.list().find(e => e.id === id) || null; },
  create(data) {
    const now = new Date().toISOString();
    const hourly = Number(data.base_rate) || 0;
    const row = {
      ...data,
      ot_rate: data.ot_rate === '' || data.ot_rate == null ? (autoOtFromHourly(hourly) ?? '') : Number(data.ot_rate),
      id: uid(), created_at: now, updated_at: now
    };
    const all = this.list();
    all.unshift(row);
    write(EMP_KEY, all);
    return row;
  },
  update(id, data) {
    const all = this.list();
    const i = all.findIndex(e => e.id === id);
    if (i === -1) return null;
    const hourly = data.base_rate != null ? Number(data.base_rate) : Number(all[i].base_rate) || 0;
    const nextOT = (data.ot_rate === '' || data.ot_rate == null)
      ? (autoOtFromHourly(hourly) ?? all[i].ot_rate ?? '')
      : Number(data.ot_rate);
    all[i] = { ...all[i], ...data, ot_rate: nextOT, updated_at: new Date().toISOString() };
    write(EMP_KEY, all);
    return all[i];
  },
  remove(id) {
    write(EMP_KEY, this.list().filter(e => e.id !== id));
  }
};

// ATTENDANCE
export const attendanceStore = {
  list() { return read(ATT_KEY); },
  listByEmployee(employee_id) { return this.list().filter(a => a.employee_id === employee_id); },
  listRange({ from, to }) {
    const rows = this.list();
    return rows.filter(r => (!from || r.work_date >= from) && (!to || r.work_date <= to));
  },
  // helper to replace all rows (internal use for migrations)
  _writeAll(next) { write(ATT_KEY, next); },
  create(data, employee) {
    const now = new Date().toISOString();
    const calc = computeHoursPay({
      base_rate: employee?.base_rate,
      ot_rate: employee?.ot_rate,
      employment_type: employee?.employment_type || 'Hourly',
      day_type: data.day_type,
      time_in: data.time_in, time_out: data.time_out, break_minutes: data.break_minutes,
      ot_override: data.ot_override
    });
    const row = { ...data, ...calc, id: uid(), created_at: now, updated_at: now };
    const all = this.list();
    all.unshift(row);
    write(ATT_KEY, all);
    return row;
  },
  update(id, patch, employee) {
    const all = this.list();
    const i = all.findIndex(r => r.id === id);
    if (i === -1) return null;
    const merged = { ...all[i], ...patch };
    const calc = computeHoursPay({
      base_rate: employee?.base_rate,
      ot_rate: employee?.ot_rate,
      employment_type: employee?.employment_type || 'Hourly',
      day_type: merged.day_type,
      time_in: merged.time_in, time_out: merged.time_out, break_minutes: merged.break_minutes,
      ot_override: merged.ot_override
    });
    all[i] = { ...merged, ...calc, updated_at: new Date().toISOString() };
    write(ATT_KEY, all);
    return all[i];
  },
  remove(id) {
    write(ATT_KEY, this.list().filter(r => r.id !== id));
  }
};

// USER ↔ EMPLOYEE mapping for /me pages
export const userMap = {
  get(username) {
    try { return JSON.parse(localStorage.getItem(MAP_KEY) || '{}')[username] || null; } catch { return null; }
  },
  set(username, employee_id) {
    const map = (() => { try { return JSON.parse(localStorage.getItem(MAP_KEY) || '{}'); } catch { return {}; }})();
    map[username] = employee_id;
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
  }
};

// CSV
export function toCsv(rows, headers) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n');
  return head + '\n' + body;
}

