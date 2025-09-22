/**
 * Formatting utilities for the Payroll & Attendance System
 * Provides Philippine-specific formatting functions for currency, dates, and other data
 */

/**
 * Format currency in Philippine Peso (PHP)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show PHP symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₱0.00' : '0.00';
  }
  
  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return showSymbol ? formatted : formatted.replace('₱', '').trim();
};

/**
 * Format date in Philippine format (MM/DD/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

/**
 * Format datetime in Philippine format (MM/DD/YYYY HH:MM AM/PM)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
};

/**
 * Format time in 12-hour format (HH:MM AM/PM)
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const timeObj = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time;
  
  if (isNaN(timeObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(timeObj);
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('en-PH', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Format phone number in Philippine format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +63 XXX XXX XXXX
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+63 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // Format as +63 XXX XXX XXXX
  if (cleaned.length === 10) {
    return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Format employee ID with padding
 * @param {number|string} id - Employee ID to format
 * @param {number} length - Desired length with padding (default: 4)
 * @returns {string} Formatted employee ID
 */
export const formatEmployeeId = (id, length = 4) => {
  if (!id) return '';
  
  return String(id).padStart(length, '0');
};

/**
 * Format name with proper capitalization
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format address with proper capitalization
 * @param {string} address - Address to format
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  return address
    .toLowerCase()
    .split(',')
    .map(part => part.trim())
    .map(part => 
      part.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(', ');
};

/**
 * Format SSS number with dashes
 * @param {string} sss - SSS number to format
 * @returns {string} Formatted SSS number
 */
export const formatSSS = (sss) => {
  if (!sss) return '';
  
  const cleaned = sss.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  
  return sss;
};

/**
 * Format PhilHealth number with dashes
 * @param {string} philhealth - PhilHealth number to format
 * @returns {string} Formatted PhilHealth number
 */
export const formatPhilHealth = (philhealth) => {
  if (!philhealth) return '';
  
  const cleaned = philhealth.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  
  return philhealth;
};

/**
 * Format Pag-IBIG number with dashes
 * @param {string} pagibig - Pag-IBIG number to format
 * @returns {string} Formatted Pag-IBIG number
 */
export const formatPagIBIG = (pagibig) => {
  if (!pagibig) return '';
  
  const cleaned = pagibig.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  
  return pagibig;
};

export default {
  currency: formatCurrency,
  date: formatDate,
  datetime: formatDateTime,
  time: formatTime,
  number: formatNumber,
  percentage: formatPercentage,
  phone: formatPhone,
  employeeId: formatEmployeeId,
  name: formatName,
  address: formatAddress,
  sss: formatSSS,
  philhealth: formatPhilHealth,
  pagibig: formatPagIBIG
};
