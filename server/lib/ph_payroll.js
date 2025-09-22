// Philippines Labor Law Compliant Payroll Calculations
// Implements PH labor code requirements for overtime, holiday pay, deductions

const db = require('better-sqlite3');

// Convert time string (HH:MM) to minutes
function timeToMinutes(timeStr) {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes to time string (HH:MM)
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Check if time is within night differential period (10PM-6AM)
function isNightDifferential(timeStr) {
  if (!timeStr) return false;
  const minutes = timeToMinutes(timeStr);
  if (minutes === null) return false;
  // 10PM = 1320 minutes, 6AM = 360 minutes
  return minutes >= 1320 || minutes <= 360;
}

// Calculate night differential hours
function calculateNightDifferentialHours(timeIn, timeOut, breakMinutes = 0) {
  const inMinutes = timeToMinutes(timeIn);
  const outMinutes = timeToMinutes(timeOut);
  
  if (inMinutes === null || outMinutes === null) return 0;
  
  let nightHours = 0;
  const totalMinutes = outMinutes > inMinutes ? outMinutes - inMinutes : (outMinutes + 1440) - inMinutes;
  const breakMins = Number(breakMinutes) || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMins);
  
  // Check each hour for night differential
  for (let i = 0; i < workMinutes; i += 60) {
    const currentTime = (inMinutes + i) % 1440;
    if (currentTime >= 1320 || currentTime <= 360) {
      nightHours += 1;
    }
  }
  
  return Math.min(nightHours, workMinutes / 60);
}

// Calculate overtime hours (PH labor code: 8 hours = regular work)
function calculateOvertimeHours(timeIn, timeOut, breakMinutes = 0) {
  const inMinutes = timeToMinutes(timeIn);
  const outMinutes = timeToMinutes(timeOut);
  
  if (inMinutes === null || outMinutes === null) return 0;
  
  const totalMinutes = outMinutes > inMinutes ? outMinutes - inMinutes : (outMinutes + 1440) - inMinutes;
  const breakMins = Number(breakMinutes) || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMins);
  const workHours = workMinutes / 60;
  
  // PH labor code: 8 hours = regular work, anything over = overtime
  return Math.max(0, workHours - 8);
}

// Calculate regular hours (PH labor code: max 8 hours)
function calculateRegularHours(timeIn, timeOut, breakMinutes = 0) {
  const inMinutes = timeToMinutes(timeIn);
  const outMinutes = timeToMinutes(timeOut);
  
  if (inMinutes === null || outMinutes === null) return 0;
  
  const totalMinutes = outMinutes > inMinutes ? outMinutes - inMinutes : (outMinutes + 1440) - inMinutes;
  const breakMins = Number(breakMinutes) || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMins);
  const workHours = workMinutes / 60;
  
  // PH labor code: max 8 hours regular
  return Math.min(8, workHours);
}

// Calculate total hours worked
function calculateTotalHours(timeIn, timeOut, breakMinutes = 0) {
  const inMinutes = timeToMinutes(timeIn);
  const outMinutes = timeToMinutes(timeOut);
  
  if (inMinutes === null || outMinutes === null) return 0;
  
  const totalMinutes = outMinutes > inMinutes ? outMinutes - inMinutes : (outMinutes + 1440) - inMinutes;
  const breakMins = Number(breakMinutes) || 0;
  const workMinutes = Math.max(0, totalMinutes - breakMins);
  
  return workMinutes / 60;
}

// Check if date is a holiday
function isHoliday(date, db) {
  if (!db) return null;
  
  try {
    const stmt = db.prepare(`
      SELECT holiday_type FROM ph_holidays 
      WHERE holiday_date = ? AND (is_recurring = 1 OR strftime('%Y', holiday_date) = strftime('%Y', ?))
    `);
    const result = stmt.get(date, date);
    return result ? result.holiday_type : null;
  } catch (error) {
    // If table doesn't exist or any other error, return null (no holiday)
    console.warn('Holiday check failed:', error.message);
    return null;
  }
}

// Calculate daily pay based on employment type and PH labor law
function calculateDailyPay(employee, attendance, dayType = 'Regular', db = null) {
  const {
    employment_type,
    basic_salary,
    daily_rate,
    hourly_rate,
    overtime_rate
  } = employee;
  
  const {
    time_in,
    time_out,
    break_minutes,
    day_type,
    manual_overtime_hours
  } = attendance;
  
  const holidayType = isHoliday(attendance.work_date, db);
  const isHolidayWork = holidayType !== null;
  const isRestDay = day_type === 'Rest Day';
  
  let regularHours = calculateRegularHours(time_in, time_out, break_minutes);
  let overtimeHours = calculateOvertimeHours(time_in, time_out, break_minutes);
  const nightDiffHours = calculateNightDifferentialHours(time_in, time_out, break_minutes);
  
  // Use manual overtime if provided
  if (manual_overtime_hours && manual_overtime_hours > 0) {
    overtimeHours = Math.min(manual_overtime_hours, regularHours + overtimeHours);
    regularHours = Math.max(0, regularHours - manual_overtime_hours);
  }
  
  let regularPay = 0;
  let overtimePay = 0;
  let nightDiffPay = 0;
  let holidayPay = 0;
  let restDayPay = 0;
  
  // Calculate base pay based on employment type
  if (employment_type === 'Regular' || employment_type === 'Probationary') {
    // Monthly salary - calculate daily rate
    const dailyRate = basic_salary / 22; // 22 working days per month
    regularPay = regularHours * (dailyRate / 8); // Convert to hourly rate
  } else if (employment_type === 'Daily') {
    regularPay = regularHours * (daily_rate / 8); // Convert to hourly rate
  } else if (employment_type === 'Part-time') {
    regularPay = regularHours * hourly_rate;
  }
  
  // Calculate overtime pay (PH labor code rates)
  if (overtimeHours > 0) {
    let otRate = overtime_rate || (hourly_rate * 1.25); // Default 125% for regular overtime
    
    if (isHolidayWork) {
      if (isRestDay) {
        otRate = hourly_rate * 2.0; // 200% for holiday + rest day
      } else {
        otRate = hourly_rate * 2.0; // 200% for holiday
      }
    } else if (isRestDay) {
      otRate = hourly_rate * 1.3; // 130% for rest day
    }
    
    overtimePay = overtimeHours * otRate;
  }
  
  // Calculate night differential (10% additional)
  if (nightDiffHours > 0) {
    const nightDiffRate = hourly_rate * 0.10; // 10% night differential
    nightDiffPay = nightDiffHours * nightDiffRate;
  }
  
  // Calculate holiday pay
  if (isHolidayWork) {
    if (holidayType === 'Regular Holiday') {
      holidayPay = hourly_rate * 8; // 8 hours at regular rate
    } else if (holidayType === 'Special Non-Working Day') {
      holidayPay = hourly_rate * 8 * 0.3; // 30% of regular rate
    }
  }
  
  // Calculate rest day pay
  if (isRestDay && !isHolidayWork) {
    restDayPay = hourly_rate * 8 * 0.3; // 30% additional for rest day
  }
  
  const totalDailyPay = regularPay + overtimePay + nightDiffPay + holidayPay + restDayPay;
  
  return {
    regular_hours: Math.round(regularHours * 100) / 100,
    overtime_hours: Math.round(overtimeHours * 100) / 100,
    night_differential_hours: Math.round(nightDiffHours * 100) / 100,
    regular_pay: Math.round(regularPay * 100) / 100,
    overtime_pay: Math.round(overtimePay * 100) / 100,
    night_differential_pay: Math.round(nightDiffPay * 100) / 100,
    holiday_pay: Math.round(holidayPay * 100) / 100,
    rest_day_pay: Math.round(restDayPay * 100) / 100,
    total_daily_pay: Math.round(totalDailyPay * 100) / 100,
    is_holiday: isHolidayWork ? 1 : 0,
    holiday_type: holidayType
  };
}

// Calculate SSS contribution
function calculateSSSContribution(salary) {
  const db = require('better-sqlite3');
  const stmt = db.prepare(`
    SELECT employee_contribution, employer_contribution, total_contribution 
    FROM sss_contributions 
    WHERE ? BETWEEN salary_range_min AND salary_range_max 
    ORDER BY effective_date DESC 
    LIMIT 1
  `);
  const result = stmt.get(salary);
  return result || { employee_contribution: 0, employer_contribution: 0, total_contribution: 0 };
}

// Calculate PhilHealth contribution
function calculatePhilHealthContribution(salary) {
  const db = require('better-sqlite3');
  const stmt = db.prepare(`
    SELECT monthly_premium 
    FROM philhealth_contributions 
    WHERE ? BETWEEN salary_range_min AND salary_range_max 
    ORDER BY effective_date DESC 
    LIMIT 1
  `);
  const result = stmt.get(salary);
  return result ? result.monthly_premium : 0;
}

// Calculate Pag-IBIG contribution
function calculatePagIBIGContribution(salary) {
  const db = require('better-sqlite3');
  const stmt = db.prepare(`
    SELECT employee_contribution, employer_contribution, total_contribution 
    FROM pagibig_contributions 
    WHERE ? BETWEEN salary_range_min AND salary_range_max 
    ORDER BY effective_date DESC 
    LIMIT 1
  `);
  const result = stmt.get(salary);
  return result || { employee_contribution: 0, employer_contribution: 0, total_contribution: 0 };
}

// Calculate BIR tax withholding
function calculateBIRTax(grossSalary) {
  const db = require('better-sqlite3');
  const stmt = db.prepare(`
    SELECT fixed_tax, percentage_rate, excess_over 
    FROM bir_tax_table 
    WHERE ? BETWEEN salary_range_min AND salary_range_max 
    ORDER BY effective_date DESC 
    LIMIT 1
  `);
  const result = stmt.get(grossSalary);
  
  if (!result) return 0;
  
  const { fixed_tax, percentage_rate, excess_over } = result;
  const excessAmount = Math.max(0, grossSalary - excess_over);
  const tax = fixed_tax + (excessAmount * percentage_rate);
  
  return Math.round(tax * 100) / 100;
}

// Calculate all deductions for an employee
function calculateDeductions(employee, grossSalary) {
  const sss = calculateSSSContribution(grossSalary);
  const philhealth = calculatePhilHealthContribution(grossSalary);
  const pagibig = calculatePagIBIGContribution(grossSalary);
  const birTax = calculateBIRTax(grossSalary);
  
  const totalDeductions = sss.employee_contribution + philhealth + pagibig.employee_contribution + birTax;
  const netSalary = grossSalary - totalDeductions;
  
  return {
    sss_employee: sss.employee_contribution,
    sss_employer: sss.employer_contribution,
    philhealth: philhealth,
    pagibig_employee: pagibig.employee_contribution,
    pagibig_employer: pagibig.employer_contribution,
    bir_tax: birTax,
    total_deductions: totalDeductions,
    net_salary: netSalary
  };
}

// Format currency in Philippine Peso
function formatCurrency(amount) {
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date in MM/DD/YYYY format (US format used in PH)
function formatDate(date) {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  isNightDifferential,
  calculateNightDifferentialHours,
  calculateOvertimeHours,
  calculateRegularHours,
  calculateTotalHours,
  isHoliday,
  calculateDailyPay,
  calculateSSSContribution,
  calculatePhilHealthContribution,
  calculatePagIBIGContribution,
  calculateBIRTax,
  calculateDeductions,
  formatCurrency,
  formatDate
};
