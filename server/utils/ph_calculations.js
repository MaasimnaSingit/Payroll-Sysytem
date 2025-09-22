const db = require('../db');

// Calculate SSS contribution
function calculateSSS(monthlySalary) {
    const row = db.getSSS.get(monthlySalary);
    if (!row) {
        // Use maximum for salaries above the ceiling
        return db.getSSS.get(999999.99);
    }
    return {
        ee: row.ee_contribution,
        er: row.er_contribution,
        total: row.ee_contribution + row.er_contribution
    };
}

// Calculate PhilHealth premium
function calculatePhilHealth(monthlySalary) {
    const row = db.getPhilHealth.get(monthlySalary);
    if (!row) return { ee: 0, er: 0, total: 0 };

    const premium = Math.min(
        Math.max(
            monthlySalary * row.premium_rate,
            row.minimum_contribution
        ),
        row.maximum_contribution
    );

    return {
        ee: premium / 2,
        er: premium / 2,
        total: premium
    };
}

// Calculate Pag-IBIG contribution
function calculatePagIBIG(monthlySalary) {
    const row = db.getPagIBIG.get(monthlySalary);
    if (!row) return { ee: 0, er: 0, total: 0 };

    const ee = Math.min(monthlySalary * row.ee_rate, row.maximum_contribution);
    const er = Math.min(monthlySalary * row.er_rate, row.maximum_contribution);

    return {
        ee,
        er,
        total: ee + er
    };
}

// Calculate BIR tax
function calculateBIRTax(taxableIncome) {
    const row = db.getBIRTax.get(taxableIncome);
    if (!row) return 0;

    const excessIncome = taxableIncome - row.range_start;
    return row.base_tax + (excessIncome * row.tax_rate);
}

// Calculate overtime pay
function calculateOTPay(hourlyRate, otHours, dayType = 'Regular') {
    const rates = {
        'Regular': 1.25,      // Regular overtime (125%)
        'Rest day': 1.30,     // Rest day overtime (130%)
        'Holiday': 2.00,      // Holiday overtime (200%)
        'Holiday-Rest': 2.60  // Holiday on rest day (260%)
    };

    const rate = rates[dayType] || rates.Regular;
    return hourlyRate * otHours * rate;
}

// Calculate night differential
function calculateNightDiff(hourlyRate, nightHours) {
    return hourlyRate * nightHours * 0.10; // 10% night differential
}

// Calculate total deductions
function calculateDeductions(salary, otPay = 0) {
    const monthlySalary = salary + otPay;
    
    const sss = calculateSSS(monthlySalary);
    const philhealth = calculatePhilHealth(monthlySalary);
    const pagibig = calculatePagIBIG(monthlySalary);
    
    // Calculate taxable income
    const totalDeductions = sss.ee + philhealth.ee + pagibig.ee;
    const taxableIncome = monthlySalary - totalDeductions;
    
    const tax = calculateBIRTax(taxableIncome);
    
    return {
        sss: sss.ee,
        philhealth: philhealth.ee,
        pagibig: pagibig.ee,
        tax,
        total: totalDeductions + tax
    };
}

// Calculate complete payroll
function calculatePayroll(employee, attendance, options = {}) {
    const {
        hourlyRate = employee.hourly_rate,
        dailyRate = employee.daily_rate,
        baseSalary = employee.base_salary
    } = options;

    // Calculate regular pay
    const regularHours = attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
    const regularPay = regularHours * hourlyRate;

    // Calculate overtime pay
    const otHours = attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
    const otPay = attendance.reduce((sum, a) => {
        return sum + calculateOTPay(hourlyRate, a.overtime_hours || 0, a.day_type);
    }, 0);

    // Calculate night differential
    const nightHours = attendance.reduce((sum, a) => sum + (a.night_hours || 0), 0);
    const nightDiffPay = calculateNightDiff(hourlyRate, nightHours);

    // Calculate gross pay
    const grossPay = regularPay + otPay + nightDiffPay;

    // Calculate deductions
    const deductions = calculateDeductions(baseSalary, otPay);

    // Calculate net pay
    const netPay = grossPay - deductions.total;

    return {
        regular_hours: regularHours,
        overtime_hours: otHours,
        night_diff_hours: nightHours,
        basic_pay: regularPay,
        overtime_pay: otPay,
        night_diff_pay: nightDiffPay,
        gross_pay: grossPay,
        sss_contribution: deductions.sss,
        philhealth_contribution: deductions.philhealth,
        pagibig_contribution: deductions.pagibig,
        bir_tax: deductions.tax,
        total_deductions: deductions.total,
        net_pay: netPay
    };
}

module.exports = {
    calculateSSS,
    calculatePhilHealth,
    calculatePagIBIG,
    calculateBIRTax,
    calculateOTPay,
    calculateNightDiff,
    calculateDeductions,
    calculatePayroll
};
