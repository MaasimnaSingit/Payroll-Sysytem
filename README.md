# Payroll & Attendance System

A modern, secure, and fully-featured payroll and attendance management system built with Electron, React, Vite, and SQLite.

## 🚀 Features

- **Secure Authentication**: Role-based access control with bcrypt password hashing
- **Admin Dashboard**: Complete employee and payroll management
- **Employee Portal**: Time clock, attendance tracking, and request management
- **Real-time Data**: Live synchronization between admin and employee interfaces
- **Web Base System**: Server through Vultr and subdomain from existing domain of user client
- **Modern UI**: Premium dark theme with Tailwind CSS
- **Responsive Design**: Works seamlessly on all screen sizes

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Electron (Node.js)
- **Database**: SQLite (local storage)
- **Authentication**: bcryptjs for password hashing
- **Build Tool**: electron-builder for Windows distribution

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Windows 10/11 (for building)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

```bash
# Start the development server
npm run electron-dev
```

This will:
- Start Vite dev server on port 5173
- Launch Electron app
- Open DevTools automatically

### 3. Build for Production

```bash
# Build the React app
npm run build

# Package for Windows
npm run dist
```

The Windows installer will be created in the `dist` folder.

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Employee Accounts:** Create via admin panel

## 📁 Project Structure

```
payroll-attendance-system/
├── electron/                 # Electron main process
│   ├── main.js              # Main process entry point
│   └── preload.js           # Preload script for security
├── src/                     # React application
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components
│   │   └── employee/       # Employee-specific components
│   ├── contexts/           # React contexts
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── dist/                   # Built application
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## 🔧 Configuration

### Database Location
The SQLite database is stored in the Electron app's user data directory:
- Windows: `%APPDATA%/payroll-attendance-system/payroll_system.db`

### Development vs Production
- **Development**: Uses Vite dev server with hot reload
- **Production**: Serves built React app from `dist` folder

## 🧪 Testing Checklist

### Login System Testing

- [ ] **Default Admin Login**
  - [ ] Can login with `admin` / `admin123`
  - [ ] Redirects to Admin Dashboard
  - [ ] Shows correct user info in header

- [ ] **Form Validation**
  - [ ] Login button disabled until fields filled
  - [ ] Clear error messages for invalid credentials
  - [ ] Field-specific validation messages

- [ ] **Security Features**
  - [ ] Passwords never exposed to renderer process
  - [ ] bcrypt hashing working correctly
  - [ ] Session persistence across app restarts

- [ ] **UI/UX**
  - [ ] Premium dark theme applied
  - [ ] Responsive design on different screen sizes
  - [ ] Smooth animations and transitions
  - [ ] Loading states during authentication

- [ ] **Navigation**
  - [ ] Logout functionality works
  - [ ] Redirects to login after logout
  - [ ] Protected routes working correctly

### Database Testing

- [ ] **SQLite Setup**
  - [ ] Database created in correct location
  - [ ] Users table created with proper schema
  - [ ] Default admin account created

- [ ] **Data Persistence**
  - [ ] User data persists after app restart
  - [ ] Database file accessible and readable

### Build Testing

- [ ] **Development Build**
  - [ ] `npm run electron-dev` starts successfully
  - [ ] Hot reload working
  - [ ] DevTools accessible

- [ ] **Production Build**
  - [ ] `npm run build` completes without errors
  - [ ] `npm run dist` creates Windows installer
  - [ ] Installed app runs correctly

## 🚀 Next Steps

After confirming the login system works:

1. **Employee Management Module**
   - Add employee CRUD operations
   - Employee profile management
   - Role assignment

2. **Attendance System**
   - Time clock functionality
   - Attendance tracking
   - Manual entry corrections

3. **Payroll Processing**
   - Salary calculation engine
   - Overtime and leave calculations
   - Payroll generation

4. **Request Management**
   - Leave request workflow
   - Overtime request system
   - Approval process

5. **Reporting & Export**
   - Attendance reports
   - Payroll reports
   - CSV export functionality

6. **Payslip Generation**
   - Printable payslips
   - PDF generation
   - Email functionality

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if SQLite is properly installed
   - Verify app has write permissions to user data directory

2. **Build Errors**
   - Ensure Node.js version is 16+
   - Clear `node_modules` and reinstall dependencies
   - Check for Windows-specific build tools

3. **Authentication Issues**
   - Verify bcryptjs is properly installed
   - Check database file permissions
   - Clear localStorage if session issues occur

### Development Tips

- Use `console.log` in main process for debugging
- Check Electron DevTools for renderer process logs
- Monitor database file for data integrity

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

