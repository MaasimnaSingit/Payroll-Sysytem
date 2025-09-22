// PH Payroll Calculations Service

// SSS Contribution Table 2024
const SSS_TABLE = [
    { min: 0, max: 4249.99, ee: 180.00, er: 360.00 },
    { min: 4250, max: 4749.99, ee: 202.50, er: 405.00 },
    { min: 4750, max: 5249.99, ee: 225.00, er: 450.00 },
    // ... more brackets
    { min: 19750, max: 20249.99, ee: 900.00, er: 1800.00 },
    { min: 20250, max: 20749.99, ee: 922.50, er: 1845.00 },
    { min: 20750, max: Infinity, ee: 945.00, er: 1890.00 }
];

// PhilHealth Contribution 2024
const PHILHEALTH_RATE = 0.045; // 4.5%
const PHILHEALTH_MIN = 400;
const PHILHEALTH_MAX = 3200;

// Pag-IBIG Contribution 2024
const PAGIBIG_RATES = {
    BELOW_1500: 0.01,
    ABOVE_1500: 0.02
};
const PAGIBIG_MAX = 100;

// BIR Tax Table 2024
const BIR_TABLE = [
    { min: 0, max: 250000, rate: 0, base: 0 },
    { min: 250000.01, max: 400000, rate: 0.15, base: 0 },
    { min: 400000.01, max: 800000, rate: 0.20, base: 22500 },
    { min: 800000.01, max: 2000000, rate: 0.25, base: 102500 },
    { min: 2000000.01, max: 8000000, rate: 0.30, base: 402500 },
    { min: 8000000.01, max: Infinity, rate: 0.35, base: 2202500 }
];

class PayrollCalculator {
    // Calculate SSS contribution
    static calculateSSS(monthlySalary) {
        const bracket = SSS_TABLE.find(b => 
            monthlySalary >= b.min && monthlySalary <= b.max
        ) || SSS_TABLE[SSS_TABLE.length - 1];

        return {
            ee: bracket.ee,
            er: bracket.er,
            total: bracket.ee + bracket.er
        };
    }

    // Calculate PhilHealth contribution
    static calculatePhilHealth(monthlySalary) {
        const premium = Math.min(
            Math.max(
                monthlySalary * PHILHEALTH_RATE,
                PHILHEALTH_MIN
            ),
            PHILHEALTH_MAX
        );

        return {
            ee: premium / 2,
            er: premium / 2,
            total: premium
        };
    }

    // Calculate Pag-IBIG contribution
    static calculatePagIBIG(monthlySalary) {
        const rate = monthlySalary <= 1500 ? 
            PAGIBIG_RATES.BELOW_1500 : 
            PAGIBIG_RATES.ABOVE_1500;

        const contribution = Math.min(monthlySalary * rate, PAGIBIG_MAX);

        return {
            ee: contribution,
            er: contribution,
            total: contribution * 2
        };
    }

    // Calculate BIR tax
    static calculateBIRTax(annualTaxableIncome) {
        const bracket = BIR_TABLE.find(b => 
            annualTaxableIncome > b.min && annualTaxableIncome <= b.max
        ) || BIR_TABLE[BIR_TABLE.length - 1];

        const excessIncome = annualTaxableIncome - bracket.min;
        return bracket.base + (excessIncome * bracket.rate);
    }

    // Calculate overtime pay
    static calculateOTPay(hourlyRate, otHours, dayType = 'Regular') {
        const rates = {
            'Regular': 1.25,      // Regular overtime (125%)
            'Rest day': 1.30,     // Rest day overtime (130%)
            'Regular Holiday': 2.00,     // Holiday overtime (200%)
            'Special Holiday': 1.30,     // Special holiday overtime (130%)
            'Double Holiday': 3.00,      // Double holiday overtime (300%)
            'Rest day Holiday': 2.60     // Holiday on rest day (260%)
        };

        const rate = rates[dayType] || rates.Regular;
        return hourlyRate * otHours * rate;
    }

    // Calculate night differential
    static calculateNightDiff(hourlyRate, nightHours) {
        return hourlyRate * nightHours * 0.10; // 10% night differential
    }

    // Calculate holiday pay
    static calculateHolidayPay(dailyRate, dayType = 'Regular Holiday') {
        const rates = {
            'Regular Holiday': 1.00,     // Additional 100%
            'Special Holiday': 0.30,     // Additional 30%
            'Double Holiday': 2.00,      // Additional 200%
            'Rest day Holiday': 1.30     // Additional 130%
        };

        const rate = rates[dayType] || 0;
        return dailyRate * rate;
    }

    // Calculate complete payroll
    static calculatePayroll(employee, attendance, period) {
        // Initialize totals
        let regularHours = 0;
        let overtimeHours = 0;
        let nightDiffHours = 0;
        let basicPay = 0;
        let overtimePay = 0;
        let nightDiffPay = 0;
        let holidayPay = 0;

        // Process each attendance record
        attendance.forEach(record => {
            // Regular hours
            if (!record.is_holiday && !record.is_rest_day) {
                regularHours += record.hours_worked || 0;
                basicPay += (record.hours_worked || 0) * employee.hourly_rate;
            }

            // Overtime
            if (record.overtime_hours > 0) {
                overtimeHours += record.overtime_hours;
                overtimePay += this.calculateOTPay(
                    employee.hourly_rate,
                    record.overtime_hours,
                    record.day_type
                );
            }

            // Night differential
            if (record.night_diff_hours > 0) {
                nightDiffHours += record.night_diff_hours;
                nightDiffPay += this.calculateNightDiff(
                    employee.hourly_rate,
                    record.night_diff_hours
                );
            }

            // Holiday pay
            if (record.is_holiday) {
                holidayPay += this.calculateHolidayPay(
                    employee.daily_rate,
                    record.day_type
                );
            }
        });

        // Calculate gross pay
        const grossPay = basicPay + overtimePay + nightDiffPay + holidayPay;

        // Calculate monthly rate for government contributions
        const daysInMonth = 22; // Standard working days
        const monthlyRate = employee.daily_rate * daysInMonth;

        // Calculate government contributions
        const sss = this.calculateSSS(monthlyRate);
        const philhealth = this.calculatePhilHealth(monthlyRate);
        const pagibig = this.calculatePagIBIG(monthlyRate);

        // Calculate taxable income
        const totalDeductions = sss.ee + philhealth.ee + pagibig.ee;
        const taxableIncome = grossPay - totalDeductions;

        // Calculate tax (convert to annual then back to period)
        const annualizedIncome = taxableIncome * (365 / period.days);
        const annualTax = this.calculateBIRTax(annualizedIncome);
        const periodTax = annualTax * (period.days / 365);

        // Calculate net pay
        const netPay = grossPay - totalDeductions - periodTax;

        return {
            regular_hours: regularHours,
            overtime_hours: overtimeHours,
            night_diff_hours: nightDiffHours,
            basic_pay: basicPay,
            overtime_pay: overtimePay,
            night_diff_pay: nightDiffPay,
            holiday_pay: holidayPay,
            gross_pay: grossPay,
            sss_contribution: sss.ee,
            philhealth_contribution: philhealth.ee,
            pagibig_contribution: pagibig.ee,
            bir_tax: periodTax,
            net_pay: netPay,
            total_deductions: totalDeductions + periodTax
        };
    }
}

module.exports = PayrollCalculator;
