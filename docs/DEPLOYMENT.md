# 🚀 TGPS Payroll System - Deployment Guide

## System Overview

The TGPS Payroll System is a comprehensive Philippines-compliant payroll and attendance management system built with modern technologies:

- **Frontend:** Electron + React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Hosting:** Vultr Server

## 🔐 Client Credentials

```
Username: Tgpspayroll
Password: Tgpspayroll16**
```

## ✨ Key Features

### 1. Employee Management
- Complete employee information management
- PH-compliant employee fields
- Government ID tracking (SSS, PhilHealth, Pag-IBIG, TIN)
- Professional employee directory

### 2. Attendance Tracking
- Clock in/out functionality
- PH time calculations
- Overtime and night differential
- Holiday and rest day tracking
- Photo capture support

### 3. Payroll Processing
- PH-compliant payroll calculations
- Government deductions:
  - SSS contributions
  - PhilHealth premiums
  - Pag-IBIG contributions
  - BIR tax withholding
- Professional payslip generation
- CSV export functionality

### 4. Leave Management
- PH-compliant leave types:
  - Service Incentive Leave (SIL)
  - Maternity Leave
  - Paternity Leave
  - Solo Parent Leave
  - Bereavement Leave
- Leave request workflow
- Balance tracking
- Calendar view

## 🛠️ Production Deployment

### Environment Setup
1. Install Node.js 18+ and npm
2. Clone repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-secure-secret
   DB_PATH=/path/to/production.db
   ```

### Database Setup
1. Initialize database:
   ```bash
   npm run db:init
   ```
2. Run migrations:
   ```bash
   npm run db:migrate
   ```
3. Verify admin account:
   ```bash
   npm run verify:admin
   ```

### Server Deployment (Vultr)
1. SSH into server:
   ```bash
   ssh root@your-vultr-ip
   ```
2. Install dependencies:
   ```bash
   apt update && apt install -y nodejs npm
   ```
3. Clone and setup:
   ```bash
   git clone https://github.com/your-repo/tgps-payroll
   cd tgps-payroll
   npm install
   npm run build
   ```
4. Start server:
   ```bash
   npm run start:prod
   ```

## 🔧 Troubleshooting Guide

### Common Issues

1. **Login Issues**
   - Verify credentials are correct
   - Check server is running
   - Clear browser cache if needed

2. **Database Issues**
   - Check database file exists
   - Verify file permissions
   - Run migrations if needed

3. **Server Issues**
   - Check server logs
   - Verify port is available
   - Check environment variables

4. **Performance Issues**
   - Clear application cache
   - Restart server if needed
   - Check server resources

## 📱 User Guides

### Admin Guide

1. **First Login**
   - Use provided TGPS credentials
   - Change password if needed
   - Configure company information

2. **Employee Management**
   - Add new employees with complete PH details
   - Update employee information
   - Manage employee status

3. **Attendance Management**
   - Monitor employee attendance
   - Handle time corrections
   - Process overtime requests

4. **Payroll Processing**
   - Run payroll calculations
   - Review deductions
   - Generate payslips
   - Export reports

5. **Leave Management**
   - Review leave requests
   - Track leave balances
   - Handle approvals

### Employee Guide

1. **Portal Access**
   - Use provided credentials
   - Change password on first login
   - Update personal information

2. **Attendance**
   - Clock in/out
   - View attendance history
   - Submit time corrections

3. **Leave Requests**
   - Submit leave requests
   - Check leave balances
   - View request status

4. **Payroll**
   - View payslips
   - Check payment history
   - Download payslips

## 🆘 Support Information

For technical support:
1. Check troubleshooting guide
2. Contact system administrator
3. Email support: support@tgps.com
4. Emergency contact: +63 xxx xxx xxxx

## 🔒 Security Notes

1. **Password Security**
   - Change default password
   - Use strong passwords
   - Never share credentials

2. **Data Protection**
   - Regular backups
   - Secure file permissions
   - Monitor access logs

3. **System Updates**
   - Keep system updated
   - Apply security patches
   - Monitor for vulnerabilities

## ✅ System Verification Checklist

- [ ] Login credentials working
- [ ] All features functional
- [ ] PH compliance verified
- [ ] Database initialized
- [ ] Backups configured
- [ ] Security measures active
- [ ] Documentation complete
- [ ] Support contacts verified
