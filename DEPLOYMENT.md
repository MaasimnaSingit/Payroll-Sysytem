# Vercel Deployment Instructions

## Prerequisites
1. Install Vercel CLI: npm i -g vercel
2. Login to Vercel: vercel login
3. Install dependencies: npm install

## Deployment Steps

### 1. Environment Variables
Add these environment variables in your Vercel project settings:
- JWT_SECRET: Generate a strong random string
- NODE_ENV: production
- DB_PATH: /tmp/payroll_system.db
- CORS_ORIGIN: https://your-domain.vercel.app

### 2. Deploy
```bash
# Deploy to Vercel
vercel

# Or deploy to production
vercel --prod
```

### 3. Database Setup
The database will be automatically created on first run with the schema from server/db/schema.sql

### 4. Admin Access
- Username: Tgpspayroll
- Password: Tgpspayroll16**

## Features Included
✅ Admin Dashboard
✅ Employee Management
✅ Attendance Tracking
✅ Payroll Calculations
✅ Leave Management
✅ Philippine Labor Law Compliance
✅ Photo Capture for Attendance
✅ Real-time Updates
✅ Responsive Design

## Support
For issues or questions, check the server logs in Vercel dashboard.
