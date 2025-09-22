// PH Compliance Tests

// Test SSS 2024 table
async function testSSS(salary = 25000) {
    const ranges = [
        { min: 0, max: 4250, ee: 180, er: 360 },
        { min: 4250.01, max: 4750, ee: 202.50, er: 405 },
        { min: 4750.01, max: 5250, ee: 225, er: 450 },
        // ... more ranges
        { min: 24750.01, max: 25250, ee: 1125, er: 2250 }
    ];

    for (const range of ranges) {
        if (salary >= range.min && salary <= range.max) {
            return {
                ee: range.ee,
                er: range.er
            };
        }
    }

    return {
        ee: 1125, // Maximum EE contribution
        er: 2250  // Maximum ER contribution
    };
}

// Test PhilHealth 4.5%
async function testPhilHealth(salary = 25000) {
    const rate = 0.045; // 4.5% total (employee 2.25% + employer 2.25%)
    const monthlyBasicSalary = Math.min(Math.max(salary, 10000), 100000);
    const totalContribution = monthlyBasicSalary * rate;
    
    return {
        ee: totalContribution / 2, // Employee share
        er: totalContribution / 2  // Employer share
    };
}

// Test Pag-IBIG
async function testPagIBIG(salary = 25000) {
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

// Test leave types
async function testLeaveType(type) {
    const LEAVE_TYPES = {
        SIL: {
            days: 5,
            paid: true,
            requires_approval: true
        },
        VL: {
            days: 15,
            paid: true,
            requires_approval: true
        },
        SL: {
            days: 15,
            paid: true,
            requires_approval: true
        },
        ML: {
            days: 105,
            paid: true,
            requires_approval: true
        },
        PL: {
            days: 7,
            paid: true,
            requires_approval: true
        },
        SPL: {
            days: 7,
            paid: true,
            requires_approval: true
        },
        BL: {
            days: 3,
            paid: true,
            requires_approval: true
        }
    };

    return LEAVE_TYPES[type] || false;
}

// Test regular hours
async function testRegularHours(timeIn = '08:00', timeOut = '17:00', breakMinutes = 60) {
    const start = new Date(`2000-01-01 ${timeIn}`);
    const end = new Date(`2000-01-01 ${timeOut}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = breakMinutes / 60;

    return Math.max(0, diffHours - breakHours);
}

// Test overtime
async function testOvertime(regularHours = 9, dayType = 'Regular') {
    const standardHours = 8;
    if (regularHours <= standardHours) return 0;

    const otHours = regularHours - standardHours;
    const rates = {
        'Regular': 1.25,      // Regular overtime (125%)
        'Rest day': 1.30,     // Rest day overtime (130%)
        'Regular Holiday': 2.00,     // Holiday overtime (200%)
        'Special Holiday': 1.30,     // Special holiday overtime (130%)
        'Double Holiday': 3.00,      // Double holiday overtime (300%)
        'Rest day Holiday': 2.60     // Holiday on rest day (260%)
    };

    return otHours * (rates[dayType] || rates.Regular);
}

// Test night differential
async function testNightDiff(timeIn = '22:00', timeOut = '06:00') {
    const nightStart = '22:00';
    const nightEnd = '06:00';
    const start = new Date(`2000-01-01 ${timeIn}`);
    const end = new Date(`2000-01-01 ${timeOut}`);

    // Check if work hours overlap with night shift
    const nightStartTime = new Date(`2000-01-01 ${nightStart}`);
    const nightEndTime = new Date(`2000-01-01 ${nightEnd}`);

    let nightHours = 0;

    // Calculate night hours
    if (start < nightEndTime && end > nightStartTime) {
        const nightStart = Math.max(start, nightStartTime);
        const nightEnd = Math.min(end, nightEndTime);
        nightHours = (nightEnd - nightStart) / (1000 * 60 * 60);
    }

    return nightHours;
}

module.exports = {
    testSSS,
    testPhilHealth,
    testPagIBIG,
    testLeaveType,
    testRegularHours,
    testOvertime,
    testNightDiff
};
