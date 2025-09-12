# 🚀 Quick Start Guide

## Immediate Testing Steps

### 1. Start Development Server
```bash
npm run electron-dev
```

### 2. Test Login System
1. **Wait for app to load** (you should see the login screen)
2. **Use default admin credentials:**
   - Username: `admin`
   - Password: `admin123`
3. **Click "Sign In"**
4. **Verify you're redirected to Admin Dashboard**

### 3. Test Logout
1. **Click "Logout" button** in the top-right corner
2. **Verify you're redirected back to login screen**

### 4. Test Form Validation
1. **Try submitting empty form** (button should be disabled)
2. **Enter wrong credentials** (should show error message)
3. **Start typing in fields** (error messages should clear)

## ✅ What Should Work Right Now

- ✅ **Premium dark theme UI**
- ✅ **Secure login with bcrypt hashing**
- ✅ **SQLite database with default admin account**
- ✅ **Role-based routing (admin → dashboard)**
- ✅ **Form validation and error handling**
- ✅ **Session persistence**
- ✅ **Responsive design**

## 🔧 Development Commands

```bash
# Development mode (with hot reload)
npm run electron-dev

# Build React app only
npm run build

# Build Windows installer
npm run dist

# Start Vite dev server only
npm run dev

# Start Electron only (after building)
npm run electron
```

## 📁 Key Files

- **Main Process**: `electron/main.js`
- **Login Component**: `src/components/auth/Login.jsx`
- **Auth Context**: `src/contexts/AuthContext.jsx`
- **Admin Dashboard**: `src/components/admin/AdminDashboard.jsx`
- **Database**: Created automatically in user data directory

## 🎯 Next Steps

Once login system is verified working:

1. **Employee Management Module**
2. **Attendance System**
3. **Payroll Processing**
4. **Request Management**
5. **Reporting & Export**

---

**Ready to test? Run `npm run electron-dev` and start with the login!** 🔥 