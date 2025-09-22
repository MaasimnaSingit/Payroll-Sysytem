# 🇵🇭 Philippines Payroll System - API Documentation

## Overview
This document provides comprehensive API documentation for the Philippines-compliant payroll and attendance system. All endpoints are designed to comply with Philippine labor laws and business practices.

## Base URL
```
http://localhost:8080/api/ph
```

## Authentication
All endpoints require admin authentication. Include the session cookie in requests.

## Currency & Formatting
- **Currency**: Philippine Peso (₱) with proper formatting
- **Date Format**: MM/DD/YYYY (US format used in PH)
- **Timezone**: Asia/Manila
- **Phone Numbers**: +63-XXX-XXX-XXXX format

---

## 📋 Employee Management API

### Get All Employees
```http
GET /api/ph/employees
```

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "id": 1,
      "employee_code": "EMP001",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "full_name": "Juan Santos Dela Cruz",
      "email": "juan.delacruz@company.com",
      "phone": "+63-912-345-6789",
      "employment_type": "Regular",
      "department": "IT",
      "position": "Software Developer",
      "basic_salary": 25000.00,
      "basic_salary_formatted": "₱25,000.00",
      "sss_number": "03-1234567-8",
      "philhealth_number": "12-345678901-2",
      "pagibig_number": "1234-5678-9012",
      "tin_number": "123-456-789-000",
      "status": "Active"
    }
  ]
}
```

### Get Single Employee
```http
GET /api/ph/employees/:id
```

### Create Employee
```http
POST /api/ph/employees
Content-Type: application/json

{
  "employee_code": "EMP001",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "middle_name": "Santos",
  "email": "juan.delacruz@company.com",
  "phone": "+63-912-345-6789",
  "address": "123 Rizal Street",
  "city": "Manila",
  "province": "NCR",
  "employment_type": "Regular",
  "department": "IT",
  "position": "Software Developer",
  "hire_date": "2023-01-15",
  "basic_salary": 25000.00,
  "sss_number": "03-1234567-8",
  "philhealth_number": "12-345678901-2",
  "pagibig_number": "1234-5678-9012",
  "tin_number": "123-456-789-000"
}
```

### Update Employee
```http
PUT /api/ph/employees/:id
Content-Type: application/json

{
  "basic_salary": 30000.00,
  "department": "Engineering"
}
```

### Delete Employee
```http
DELETE /api/ph/employees/:id
```

### Get Employment Types
```http
GET /api/ph/employees/employment-types
```

**Response:**
```json
{
  "success": true,
  "employment_types": [
    {
      "value": "Regular",
      "label": "Regular (Monthly Salary)",
      "description": "Permanent employee with monthly salary"
    },
    {
      "value": "Probationary",
      "label": "Probationary (6 months)",
      "description": "Probationary employee, 6-month period"
    },
    {
      "value": "Daily",
      "label": "Daily (Kasambahay, Construction)",
      "description": "Daily wage earner"
    }
  ]
}
```

---

## ⏰ Attendance Management API

### Get Attendance Records
```http
GET /api/ph/attendance?employee_id=1&start_date=2024-01-01&end_date=2024-01-31&day_type=Regular
```

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "id": 1,
      "employee_id": 1,
      "work_date": "2024-01-15",
      "work_date_formatted": "01/15/2024",
      "time_in": "08:00",
      "time_out": "17:00",
      "break_minutes": 60,
      "day_type": "Regular",
      "hours_worked": 8.0,
      "regular_hours": 8.0,
      "overtime_hours": 0.0,
      "night_differential_hours": 0.0,
      "regular_pay": 1000.00,
      "overtime_pay": 0.00,
      "night_differential_pay": 0.00,
      "holiday_pay": 0.00,
      "rest_day_pay": 0.00,
      "total_daily_pay": 1000.00,
      "total_daily_pay_formatted": "₱1,000.00",
      "is_holiday": 0,
      "holiday_type": null
    }
  ]
}
```

### Create Attendance Record
```http
POST /api/ph/attendance
Content-Type: application/json

{
  "employee_id": 1,
  "work_date": "2024-01-15",
  "time_in": "08:00",
  "time_out": "17:00",
  "break_minutes": 60,
  "day_type": "Regular",
  "manual_overtime_hours": 0,
  "notes": "Regular work day"
}
```

### Update Attendance Record
```http
PUT /api/ph/attendance/:id
Content-Type: application/json

{
  "time_out": "18:00",
  "manual_overtime_hours": 1
}
```

### Get Attendance Summary
```http
GET /api/ph/attendance/summary?start_date=2024-01-01&end_date=2024-01-31&employee_id=1
```

**Response:**
```json
{
  "success": true,
  "summary": [
    {
      "employee_id": 1,
      "employee_code": "EMP001",
      "full_name": "Juan Santos Dela Cruz",
      "employment_type": "Regular",
      "days_worked": 22,
      "total_regular_hours": 176.0,
      "total_overtime_hours": 8.0,
      "total_night_diff_hours": 0.0,
      "total_gross_pay": 22000.00,
      "total_gross_pay_formatted": "₱22,000.00"
    }
  ]
}
```

### Get Philippine Holidays
```http
GET /api/ph/attendance/holidays?year=2024
```

---

## 💰 Payroll Management API

### Calculate Payroll
```http
POST /api/ph/payroll/calculate
Content-Type: application/json

{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "employee_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "payroll_data": [
    {
      "employee_id": 1,
      "employee_code": "EMP001",
      "full_name": "Juan Santos Dela Cruz",
      "employment_type": "Regular",
      "gross_salary": 25000.00,
      "gross_salary_formatted": "₱25,000.00",
      "deductions": {
        "sss_employee": 1125.00,
        "sss_employer": 2250.00,
        "philhealth": 500.00,
        "pagibig_employee": 100.00,
        "pagibig_employer": 100.00,
        "bir_tax": 2500.00,
        "total_deductions": 4225.00,
        "total_deductions_formatted": "₱4,225.00"
      },
      "net_salary": 20775.00,
      "net_salary_formatted": "₱20,775.00"
    }
  ],
  "totals": {
    "total_employees": 1,
    "total_gross_salary": 25000.00,
    "total_deductions": 4225.00,
    "total_net_salary": 20775.00,
    "total_sss_employee": 1125.00,
    "total_sss_employer": 2250.00,
    "total_philhealth": 500.00,
    "total_pagibig_employee": 100.00,
    "total_pagibig_employer": 100.00,
    "total_bir_tax": 2500.00
  }
}
```

### Get Payroll History
```http
GET /api/ph/payroll/history?start_date=2024-01-01&end_date=2024-01-31
```

### Save Payroll Run
```http
POST /api/ph/payroll/save
Content-Type: application/json

{
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "payroll_data": [...]
}
```

### Export Payroll to CSV
```http
GET /api/ph/payroll/export?start_date=2024-01-01&end_date=2024-01-31
```

---

## 📄 Payslip Generation API

### Generate Payslip Data
```http
GET /api/ph/payslips/data/:employee_id?period_start=2024-01-01&period_end=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "payslip": {
    "employee": {
      "employee_code": "EMP001",
      "full_name": "Juan Santos Dela Cruz",
      "department": "IT",
      "position": "Software Developer",
      "employment_type": "Regular"
    },
    "period": {
      "start_date": "01/01/2024",
      "end_date": "01/31/2024"
    },
    "earnings": {
      "regular_pay": 20000.00,
      "overtime_pay": 2500.00,
      "night_differential_pay": 0.00,
      "holiday_pay": 0.00,
      "rest_day_pay": 0.00,
      "total_gross_pay": 22500.00
    },
    "deductions": {
      "sss_employee": 1012.50,
      "philhealth": 450.00,
      "pagibig_employee": 100.00,
      "bir_tax": 2250.00,
      "total_deductions": 3812.50
    },
    "net_pay": {
      "amount": 18687.50,
      "amount_formatted": "₱18,687.50"
    }
  }
}
```

### Generate PDF Payslip
```http
GET /api/ph/payslips/pdf/:employee_id?period_start=2024-01-01&period_end=2024-01-31
```

---

## 🏖️ Leave Management API

### Get Leave Types
```http
GET /api/ph/leave/types
```

**Response:**
```json
{
  "success": true,
  "leave_types": [
    {
      "id": 1,
      "leave_code": "SIL",
      "leave_name": "Service Incentive Leave",
      "leave_description": "5 days paid leave for employees with at least 1 year of service",
      "is_paid": 1,
      "max_days_per_year": 5,
      "requires_approval": 1,
      "is_ph_law_required": 1
    }
  ]
}
```

### Get Employee Leave Balances
```http
GET /api/ph/leave/balances/:employee_id?year=2024
```

### Get Leave Requests
```http
GET /api/ph/leave/requests?status=Pending&employee_id=1&leave_type=SIL
```

### Create Leave Request
```http
POST /api/ph/leave/requests
Content-Type: application/json

{
  "employee_id": 1,
  "leave_type_id": 1,
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "reason": "Family vacation",
  "emergency_contact": "+63-912-345-6789"
}
```

### Approve Leave Request
```http
PUT /api/ph/leave/requests/:id/approve
Content-Type: application/json

{
  "approval_notes": "Approved for family vacation"
}
```

### Reject Leave Request
```http
PUT /api/ph/leave/requests/:id/reject
Content-Type: application/json

{
  "approval_notes": "Insufficient leave balance"
}
```

### Get Leave Calendar
```http
GET /api/ph/leave/calendar/:employee_id?year=2024&month=2
```

### Export Leave Requests
```http
GET /api/ph/leave/export?start_date=2024-01-01&end_date=2024-01-31&status=Pending
```

---

## 🔧 Philippines Labor Law Compliance

### Overtime Calculations
- **Regular Day**: 125% of hourly rate
- **Rest Day**: 130% of hourly rate  
- **Holiday**: 200% of hourly rate
- **Holiday + Rest Day**: 200% of hourly rate

### Night Differential
- **Time Period**: 10:00 PM - 6:00 AM
- **Rate**: 10% additional to hourly rate

### Government Contributions (2024)

#### SSS Contributions
- **Salary Range**: ₱1,000 - ₱100,000
- **Employee Contribution**: ₱135 - ₱4,500
- **Employer Contribution**: ₱270 - ₱9,000

#### PhilHealth Contributions
- **Salary Range**: ₱0 - ₱100,000+
- **Monthly Premium**: ₱0 - ₱500

#### Pag-IBIG Contributions
- **Salary Range**: ₱0 - ₱100,000+
- **Employee Contribution**: ₱0 - ₱100
- **Employer Contribution**: ₱0 - ₱100

#### BIR Tax Withholding
- **Tax Table**: 2024 Monthly Tax Table
- **Exemption**: ₱20,833.33 and below
- **Rates**: 0% to 35%

### Leave Entitlements
- **Service Incentive Leave (SIL)**: 5 days (after 1 year)
- **Maternity Leave**: 105 days (female employees)
- **Paternity Leave**: 7 days (male employees)
- **Solo Parent Leave**: 7 days
- **Bereavement Leave**: 3 days (immediate family)

---

## 🚨 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **404**: Not Found
- **500**: Internal Server Error

---

## 📊 Data Validation

### Employee Data
- **Employee Code**: Unique, alphanumeric
- **Email**: Valid email format, unique
- **Phone**: Philippine format (+63-XXX-XXX-XXXX)
- **SSS**: Format XX-XXXXXXX-X
- **PhilHealth**: Format XX-XXXXXXXXX-X
- **Pag-IBIG**: Format XXXX-XXXX-XXXX
- **TIN**: Format XXX-XXX-XXX-XXX

### Attendance Data
- **Time Format**: HH:MM (24-hour)
- **Date Format**: YYYY-MM-DD
- **Break Minutes**: 0-480 (8 hours max)
- **Day Types**: Regular, Rest Day, Holiday, Special Non-Working Day

### Leave Data
- **Date Range**: Start date must be before end date
- **Leave Balance**: Must have sufficient balance
- **Overlapping**: No overlapping approved requests

---

## 🔐 Security Features

- **Authentication**: Session-based admin authentication
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: API rate limiting for sensitive endpoints
- **CORS**: Configurable cross-origin resource sharing

---

## 📈 Performance Considerations

- **Database Indexing**: Optimized indexes for common queries
- **Pagination**: Large result sets are paginated
- **Caching**: Static data is cached where appropriate
- **Connection Pooling**: Efficient database connection management

---

## 🧪 Testing

### Test Data
The system includes sample Philippine employees and test data for development and testing.

### API Testing
Use tools like Postman or curl to test the API endpoints:

```bash
# Test employee creation
curl -X POST http://localhost:8080/api/ph/employees \
  -H "Content-Type: application/json" \
  -d '{"employee_code":"TEST001","first_name":"Test","last_name":"Employee","email":"test@company.com","employment_type":"Regular","hire_date":"2024-01-01"}'
```

---

## 📞 Support

For technical support or questions about the Philippines payroll system:

1. Check the API documentation
2. Review error messages and status codes
3. Verify data format and validation rules
4. Contact the development team

---

*This documentation is updated regularly to reflect the latest features and compliance requirements.*
