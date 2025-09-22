// Philippines-compliant Frontend Utilities
// Currency formatting, date formatting, and PH-specific calculations

// Format currency in Philippine Peso
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₱0.00';
  return `₱${Number(amount).toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

// Format date in MM/DD/YYYY format (US format used in PH)
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current date in YYYY-MM-DD format
export function getCurrentDate() {
  return formatDateForInput(new Date());
}

// Get current time in HH:MM format
export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// PH Employment Types
export const EMPLOYMENT_TYPES = [
  { value: 'Regular', label: 'Regular (Monthly Salary)', description: 'Permanent employee with monthly salary' },
  { value: 'Probationary', label: 'Probationary (6 months)', description: 'Probationary employee, 6-month period' },
  { value: 'Contractual', label: 'Contractual (Fixed Term)', description: 'Fixed-term contract employee' },
  { value: 'Part-time', label: 'Part-time (Hourly)', description: 'Part-time employee paid by hour' },
  { value: 'Daily', label: 'Daily (Kasambahay, Construction)', description: 'Daily wage earner' }
];

// PH Leave Types
export const LEAVE_TYPES = [
  { value: 'SIL', label: 'Service Incentive Leave', description: '5 days paid leave for employees with at least 1 year of service' },
  { value: 'MATERNITY', label: 'Maternity Leave', description: '105 days paid maternity leave for female employees' },
  { value: 'PATERNITY', label: 'Paternity Leave', description: '7 days paid paternity leave for male employees' },
  { value: 'SOLO_PARENT', label: 'Solo Parent Leave', description: '7 days paid leave for solo parents' },
  { value: 'SICK', label: 'Sick Leave', description: 'Unpaid sick leave with medical certificate' },
  { value: 'VACATION', label: 'Vacation Leave', description: 'Paid vacation leave' },
  { value: 'EMERGENCY', label: 'Emergency Leave', description: 'Unpaid emergency leave' },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave', description: '3 days paid leave for immediate family death' },
  { value: 'BIRTHDAY', label: 'Birthday Leave', description: '1 day paid leave on birthday' }
];

// PH Day Types
export const DAY_TYPES = [
  { value: 'Regular', label: 'Regular Day', description: 'Regular working day' },
  { value: 'Rest Day', label: 'Rest Day', description: 'Employee rest day' },
  { value: 'Holiday', label: 'Holiday', description: 'Regular holiday' },
  { value: 'Special Non-Working Day', label: 'Special Non-Working Day', description: 'Special non-working day' }
];

// PH Holiday Types
export const HOLIDAY_TYPES = [
  { value: 'Regular Holiday', label: 'Regular Holiday', description: 'Regular holiday with 200% pay' },
  { value: 'Special Non-Working Day', label: 'Special Non-Working Day', description: 'Special non-working day with 130% pay' },
  { value: 'Local Holiday', label: 'Local Holiday', description: 'Local holiday' }
];

// PH Civil Status Options
export const CIVIL_STATUS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Separated', label: 'Separated' }
];

// PH Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

// PH Provinces (Major ones)
export const PH_PROVINCES = [
  'NCR (National Capital Region)',
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora',
  'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
  'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite',
  'Cebu', 'Cotabato', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental',
  'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
  'Isabela', 'Kalinga', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'La Union', 'Leyte',
  'Maguindanao', 'Marinduque', 'Masbate', 'Misamis Occidental', 'Misamis Oriental', 'Mountain Province',
  'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
  'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon',
  'Samar', 'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat',
  'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte',
  'Zamboanga del Sur', 'Zamboanga Sibugay'
];

// Calculate overtime rate based on day type
export function calculateOvertimeRate(hourlyRate, dayType, isHoliday = false) {
  if (isHoliday) {
    return hourlyRate * 2.0; // 200% for holiday
  }
  
  switch (dayType) {
    case 'Rest Day':
      return hourlyRate * 1.3; // 130% for rest day
    case 'Regular':
    default:
      return hourlyRate * 1.25; // 125% for regular overtime
  }
}

// Calculate night differential rate (10% additional)
export function calculateNightDifferentialRate(hourlyRate) {
  return hourlyRate * 0.10; // 10% night differential
}

// Validate Philippine phone number
export function validatePhoneNumber(phone) {
  const phPhoneRegex = /^(\+63|0)?[0-9]{10}$/;
  return phPhoneRegex.test(phone.replace(/\s/g, ''));
}

// Format Philippine phone number
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+63-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+63-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

// Validate Philippine TIN
export function validateTIN(tin) {
  const tinRegex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
  return tinRegex.test(tin);
}

// Format Philippine TIN
export function formatTIN(tin) {
  if (!tin) return '';
  const cleaned = tin.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-000`;
  } else if (cleaned.length === 12) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return tin;
}

// Validate Philippine SSS number
export function validateSSS(sss) {
  const sssRegex = /^\d{2}-\d{7}-\d{1}$/;
  return sssRegex.test(sss);
}

// Format Philippine SSS number
export function formatSSS(sss) {
  if (!sss) return '';
  const cleaned = sss.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}-${cleaned.slice(9)}`;
  }
  
  return sss;
}

// Validate Philippine PhilHealth number
export function validatePhilHealth(philhealth) {
  const philhealthRegex = /^\d{2}-\d{9}-\d{1}$/;
  return philhealthRegex.test(philhealth);
}

// Format Philippine PhilHealth number
export function formatPhilHealth(philhealth) {
  if (!philhealth) return '';
  const cleaned = philhealth.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 11)}-${cleaned.slice(11)}`;
  }
  
  return philhealth;
}

// Validate Philippine Pag-IBIG number
export function validatePagIBIG(pagibig) {
  const pagibigRegex = /^\d{4}-\d{4}-\d{4}$/;
  return pagibigRegex.test(pagibig);
}

// Format Philippine Pag-IBIG number
export function formatPagIBIG(pagibig) {
  if (!pagibig) return '';
  const cleaned = pagibig.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  
  return pagibig;
}

// Get Philippine timezone
export function getPHTimezone() {
  return 'Asia/Manila';
}

// Get current Philippine time
export function getCurrentPHTime() {
  return new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
}

// Calculate working days between two dates (excluding weekends)
export function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  while (start <= end) {
    const dayOfWeek = start.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
    start.setDate(start.getDate() + 1);
  }
  
  return workingDays;
}

// Check if date is a weekend
export function isWeekend(date) {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

// Get Philippine holidays for a given year
export async function getPHHolidays(year = new Date().getFullYear()) {
  try {
    const response = await fetch(`/api/ph/attendance/holidays?year=${year}`);
    const data = await response.json();
    return data.success ? data.holidays : [];
  } catch (error) {
    console.error('Error fetching PH holidays:', error);
    return [];
  }
}

// Check if date is a Philippine holiday
export async function isPHHoliday(date) {
  const holidays = await getPHHolidays(new Date(date).getFullYear());
  const dateStr = new Date(date).toISOString().split('T')[0];
  return holidays.some(holiday => holiday.holiday_date === dateStr);
}

// Export all utilities
export const phPayroll = {
  formatCurrency,
  formatDate,
  formatDateForInput,
  getCurrentDate,
  getCurrentTime,
  EMPLOYMENT_TYPES,
  LEAVE_TYPES,
  DAY_TYPES,
  HOLIDAY_TYPES,
  CIVIL_STATUS,
  GENDER_OPTIONS,
  PH_PROVINCES,
  calculateOvertimeRate,
  calculateNightDifferentialRate,
  validatePhoneNumber,
  formatPhoneNumber,
  validateTIN,
  formatTIN,
  validateSSS,
  formatSSS,
  validatePhilHealth,
  formatPhilHealth,
  validatePagIBIG,
  formatPagIBIG,
  getPHTimezone,
  getCurrentPHTime,
  calculateWorkingDays,
  isWeekend,
  getPHHolidays,
  isPHHoliday
};
