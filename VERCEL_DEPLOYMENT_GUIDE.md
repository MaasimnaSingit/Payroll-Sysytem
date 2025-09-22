# 🚀 Vercel Deployment Guide - Payroll & Attendance System

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Vercel CLI** installed globally: `npm i -g vercel`
3. **Git** repository with your code
4. **Vercel account** (free tier available)

## 🛠️ Quick Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel
```

### 4. Set Environment Variables
In your Vercel dashboard, go to Project Settings > Environment Variables and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | JWT signing secret (generate a strong random string) |
| `NODE_ENV` | `production` | Environment mode |
| `DB_PATH` | `/tmp/payroll_system.db` | Database file path |
| `CORS_ORIGIN` | `https://your-domain.vercel.app` | Your Vercel domain |

### 5. Deploy to Production
```bash
vercel --prod
```

## 🔧 Environment Variables Details

### Required Variables
- **JWT_SECRET**: Generate using `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **NODE_ENV**: Set to `production`
- **DB_PATH**: Use `/tmp/payroll_system.db` for Vercel
- **CORS_ORIGIN**: Your Vercel app URL

### Optional Variables
- **ADMIN_USERNAME**: Default admin username (default: `Tgpspayroll`)
- **ADMIN_PASSWORD**: Default admin password (default: `Tgpspayroll16**`)

## 📁 Project Structure for Vercel

```
├── api/
│   └── index.js              # Vercel serverless function
├── server/
│   ├── index.js              # Main server logic
│   ├── routes/               # API routes
│   └── db/
│       └── schema.sql        # Database schema
├── src/                      # React frontend
├── dist/                     # Built frontend (auto-generated)
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Features Included

### ✅ Core Functionality
- **Admin Dashboard**: Complete employee and attendance management
- **Employee Portal**: Clock in/out with photo capture
- **Attendance Tracking**: Real-time time tracking and calculations
- **Payroll System**: Philippine labor law compliant calculations
- **Leave Management**: Request submission and approval workflow
- **Reports**: Comprehensive reporting and data export

### ✅ Technical Features
- **Authentication**: JWT-based secure authentication
- **Database**: SQLite with automatic schema initialization
- **API**: RESTful API with proper error handling
- **Security**: Rate limiting, CORS, and input validation
- **Responsive**: Mobile-friendly design
- **Real-time**: Live updates and notifications

## 🔍 Testing Your Deployment

### 1. Health Check
Visit: `https://your-domain.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "environment": "production"
}
```

### 2. Admin Login
- URL: `https://your-domain.vercel.app`
- Username: `Tgpspayroll`
- Password: `Tgpspayroll16**`

### 3. Test Core Features
1. **Login** as admin
2. **Create** a new employee
3. **Add** attendance record
4. **View** reports and dashboard

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Problem**: Database not initializing
**Solution**: Check `DB_PATH` environment variable is set to `/tmp/payroll_system.db`

#### 2. CORS Error
**Problem**: Frontend can't connect to API
**Solution**: Set `CORS_ORIGIN` to your Vercel domain

#### 3. JWT Authentication Error
**Problem**: Login fails with "Invalid credentials"
**Solution**: Check `JWT_SECRET` is set and consistent

#### 4. Build Error
**Problem**: Vercel build fails
**Solution**: Check all dependencies are in `package.json` and run `npm install`

### Debug Commands
```bash
# Check Vercel logs
vercel logs

# Check function logs
vercel logs --follow

# Test locally
vercel dev
```

## 📊 Performance Optimization

### 1. Database Optimization
- SQLite database is automatically created on first request
- Schema is loaded from `server/db/schema.sql`
- Database persists in `/tmp` directory

### 2. API Optimization
- Rate limiting: 100 requests per 15 minutes per IP
- Request size limit: 10MB
- Proper error handling and logging

### 3. Frontend Optimization
- Vite build optimization
- Static asset serving
- Responsive design

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate JWT secrets regularly

### 2. API Security
- Rate limiting enabled
- CORS properly configured
- Input validation on all endpoints
- SQL injection protection via prepared statements

### 3. Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control

## 📈 Monitoring and Maintenance

### 1. Vercel Dashboard
- Monitor function execution
- Check error logs
- View performance metrics

### 2. Database Maintenance
- Database is automatically created
- Schema updates require redeployment
- Consider data backup strategies

### 3. Updates
- Update dependencies regularly
- Monitor security advisories
- Test thoroughly before deploying

## 🎉 Success Checklist

- [ ] Vercel CLI installed and logged in
- [ ] Project deployed to Vercel
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] Admin login successful
- [ ] Employee creation working
- [ ] Attendance system functional
- [ ] All features tested end-to-end

## 📞 Support

For issues or questions:
1. Check Vercel logs: `vercel logs`
2. Review this deployment guide
3. Check server logs in Vercel dashboard
4. Verify environment variables are set correctly

---

**🎊 Congratulations! Your Payroll & Attendance System is now live on Vercel!**
