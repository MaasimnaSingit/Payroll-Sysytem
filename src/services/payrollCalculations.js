// PH Payroll Calculations Service

// SSS Contribution Table 2024
const SSS_TABLE = {
    ranges: [
        { min: 0, max: 4250, ee: 180, er: 360 },
        { min: 4250.01, max: 4750, ee: 202.50, er: 405 },
        { min: 4750.01, max: 5250, ee: 225, er: 450 },
        { min: 5250.01, max: 5750, ee: 247.50, er: 495 },
        { min: 5750.01, max: 6250, ee: 270, er: 540 },
        { min: 6250.01, max: 6750, ee: 292.50, er: 585 },
        { min: 6750.01, max: 7250, ee: 315, er: 630 },
        { min: 7250.01, max: 7750, ee: 337.50, er: 675 },
        { min: 7750.01, max: 8250, ee: 360, er: 720 },
        { min: 8250.01, max: 8750, ee: 382.50, er: 765 },
        { min: 8750.01, max: 9250, ee: 405, er: 810 },
        { min: 9250.01, max: 9750, ee: 427.50, er: 855 },
        { min: 9750.01, max: 10250, ee: 450, er: 900 },
        { min: 10250.01, max: 10750, ee: 472.50, er: 945 },
        { min: 10750.01, max: 11250, ee: 495, er: 990 },
        { min: 11250.01, max: 11750, ee: 517.50, er: 1035 },
        { min: 11750.01, max: 12250, ee: 540, er: 1080 },
        { min: 12250.01, max: 12750, ee: 562.50, er: 1125 },
        { min: 12750.01, max: 13250, ee: 585, er: 1170 },
        { min: 13250.01, max: 13750, ee: 607.50, er: 1215 },
        { min: 13750.01, max: 14250, ee: 630, er: 1260 },
        { min: 14250.01, max: 14750, ee: 652.50, er: 1305 },
        { min: 14750.01, max: 15250, ee: 675, er: 1350 },
        { min: 15250.01, max: 15750, ee: 697.50, er: 1395 },
        { min: 15750.01, max: 16250, ee: 720, er: 1440 },
        { min: 16250.01, max: 16750, ee: 742.50, er: 1485 },
        { min: 16750.01, max: 17250, ee: 765, er: 1530 },
        { min: 17250.01, max: 17750, ee: 787.50, er: 1575 },
        { min: 17750.01, max: 18250, ee: 810, er: 1620 },
        { min: 18250.01, max: 18750, ee: 832.50, er: 1665 },
        { min: 18750.01, max: 19250, ee: 855, er: 1710 },
        { min: 19250.01, max: 19750, ee: 877.50, er: 1755 },
        { min: 19750.01, max: 20250, ee: 900, er: 1800 },
        { min: 20250.01, max: 20750, ee: 922.50, er: 1845 },
        { min: 20750.01, max: 21250, ee: 945, er: 1890 },
        { min: 21250.01, max: 21750, ee: 967.50, er: 1935 },
        { min: 21750.01, max: 22250, ee: 990, er: 1980 },
        { min: 22250.01, max: 22750, ee: 1012.50, er: 2025 },
        { min: 22750.01, max: 23250, ee: 1035, er: 2070 },
        { min: 23250.01, max: 23750, ee: 1057.50, er: 2115 },
        { min: 23750.01, max: 24250, ee: 1080, er: 2160 },
        { min: 24250.01, max: 24750, ee: 1102.50, er: 2205 },
        { min: 24750.01, max: 25250, ee: 1125, er: 2250 },
        { min: 25250.01, max: Infinity, ee: 1125, er: 2250 }
    ]
};

// PhilHealth Contribution 2024
function calculatePhilHealth(salary) {
    const rate = 0.045; // 4.5% total (employee 2.25% + employer 2.25%)
    const monthlyBasicSalary = Math.min(Math.max(salary, 10000), 100000);
    const totalContribution = monthlyBasicSalary * rate;
    
    return {
        ee: totalContribution / 2, // Employee share
        er: totalContribution / 2  // Employer share
    };
}

// Pag-IBIG Contribution 2024
function calculatePagIBIG(salary) {
    let ee, er;

    if (salary <= 1500) {
        ee = salary * 0.01; // 1%
        er = salary * 0.02; // 2%
    } else {
        ee = Math.min(salary * 0.02, 100); // 2% max 100
        er = Math.min(salary * 0.02, 100); // 2% max 100
    }

    return { ee, er };
}

// SSS Contribution
function calculateSSS(salary) {
    for (const range of SSS_TABLE.ranges) {
        if (salary >= range.min && salary <= range.max) {
            return {
                ee: range.ee,
                er: range.er
            };
        }
    }
    
    // If salary exceeds maximum range
    const maxRange = SSS_TABLE.ranges[SSS_TABLE.ranges.length - 1];
    return {
        ee: maxRange.ee,
        er: maxRange.er
    };
}

// BIR Tax Table 2024
const TAX_TABLE = [
    { min: 0, max: 250000, rate: 0, base: 0 },
    { min: 250000.01, max: 400000, rate: 0.15, base: 0 },
    { min: 400000.01, max: 800000, rate: 0.20, base: 22500 },
    { min: 800000.01, max: 2000000, rate: 0.25, base: 102500 },
    { min: 2000000.01, max: 8000000, rate: 0.30, base: 402500 },
    { min: 8000000.01, max: Infinity, rate: 0.35, base: 2202500 }
];

// Calculate BIR Tax
function calculateBIRTax(annualTaxableIncome) {
    for (const bracket of TAX_TABLE) {
        if (annualTaxableIncome >= bracket.min && annualTaxableIncome <= bracket.max) {
            const excessOverMin = annualTaxableIncome - bracket.min;
            return (bracket.base + (excessOverMin * bracket.rate)) / 12; // Monthly tax
        }
    }
    return 0;
}

// Calculate Regular Pay
function calculateRegularPay(hourlyRate, regularHours) {
    return hourlyRate * regularHours;
}

// Calculate Overtime Pay
function calculateOvertimePay(hourlyRate, overtimeHours, dayType) {
    const rates = {
        'Regular': 1.25,      // Regular overtime (125%)
        'Rest day': 1.30,     // Rest day overtime (130%)
        'Regular Holiday': 2.00,     // Holiday overtime (200%)
        'Special Holiday': 1.30,     // Special holiday overtime (130%)
        'Double Holiday': 3.00,      // Double holiday overtime (300%)
        'Rest day Holiday': 2.60     // Holiday on rest day (260%)
    };

    return hourlyRate * overtimeHours * (rates[dayType] || rates.Regular);
}

// Calculate Night Differential
function calculateNightDifferential(hourlyRate, nightHours) {
    return hourlyRate * nightHours * 0.10; // 10% night differential
}

// Calculate Holiday Pay
function calculateHolidayPay(dailyRate, dayType) {
    const rates = {
        'Regular Holiday': 1.00,     // Regular holiday (100% additional)
        'Special Holiday': 0.30,     // Special holiday (30% additional)
        'Double Holiday': 2.00,      // Double holiday (200% additional)
        'Rest day Holiday': 1.60     // Holiday on rest day (160% additional)
    };

    return dailyRate * (rates[dayType] || 0);
}

// Calculate Complete Payroll
function calculatePayroll(employee, attendance, period) {
    // Basic calculations
    const regularPay = attendance.reduce((sum, day) => {
        return sum + calculateRegularPay(employee.hourly_rate, day.regular_hours);
    }, 0);

    const overtimePay = attendance.reduce((sum, day) => {
        return sum + calculateOvertimePay(employee.hourly_rate, day.overtime_hours, day.day_type);
    }, 0);

    const nightDiffPay = attendance.reduce((sum, day) => {
        return sum + calculateNightDifferential(employee.hourly_rate, day.night_diff_hours);
    }, 0);

    const holidayPay = attendance.reduce((sum, day) => {
        if (day.day_type.includes('Holiday')) {
            return sum + calculateHolidayPay(employee.daily_rate, day.day_type);
        }
        return sum;
    }, 0);

    // Gross pay
    const grossPay = regularPay + overtimePay + nightDiffPay + holidayPay;

    // Government deductions
    const sss = calculateSSS(employee.base_salary);
    const philhealth = calculatePhilHealth(employee.base_salary);
    const pagibig = calculatePagIBIG(employee.base_salary);

    // Total deductions
    const totalDeductions = sss.ee + philhealth.ee + pagibig.ee;

    // Taxable income
    const taxableIncome = grossPay - totalDeductions;
    const tax = calculateBIRTax(taxableIncome * 12); // Annualize for tax computation

    // Net pay
    const netPay = grossPay - totalDeductions - tax;

    return {
        employee_id: employee.id,
        period_start: period.start_date,
        period_end: period.end_date,
        days_worked: attendance.length,
        regular_hours: attendance.reduce((sum, day) => sum + day.regular_hours, 0),
        overtime_hours: attendance.reduce((sum, day) => sum + day.overtime_hours, 0),
        night_diff_hours: attendance.reduce((sum, day) => sum + day.night_diff_hours, 0),
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        night_diff_pay: nightDiffPay,
        holiday_pay: holidayPay,
        gross_pay: grossPay,
        sss_ee: sss.ee,
        sss_er: sss.er,
        philhealth_ee: philhealth.ee,
        philhealth_er: philhealth.er,
        pagibig_ee: pagibig.ee,
        pagibig_er: pagibig.er,
        total_deductions: totalDeductions,
        taxable_income: taxableIncome,
        withholding_tax: tax,
        net_pay: netPay
    };
}

export {
    calculateSSS,
    calculatePhilHealth,
    calculatePagIBIG,
    calculateBIRTax,
    calculateRegularPay,
    calculateOvertimePay,
    calculateNightDifferential,
    calculateHolidayPay,
    calculatePayroll
};
