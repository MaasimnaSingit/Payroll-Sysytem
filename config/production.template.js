// Production Configuration Template
module.exports = {
  // Server Settings
  server: {
    env: 'production',
    port: 8080,
    host: '0.0.0.0'
  },

  // Security
  security: {
    jwtSecret: 'CHANGE_THIS_TO_SECURE_SECRET',
    jwtExpiry: '8h',
    bcryptRounds: 12,
    rateLimit: {
      max: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },

  // Database
  database: {
    path: '/var/lib/tgps/payroll_system.db',
    backupPath: '/var/backups/tgps'
  },

  // File Storage
  storage: {
    uploadPath: '/var/lib/tgps/uploads',
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },

  // Timezone
  timezone: 'Asia/Manila',

  // Logging
  logging: {
    level: 'info',
    path: '/var/log/tgps'
  },

  // Security Headers
  headers: {
    corsOrigin: 'https://payroll.tgps.com',
    helmetEnabled: true,
    cspEnabled: true
  },

  // Feature Flags
  features: {
    photoCapture: true,
    payslipPdf: true,
    csvExport: true
  },

  // PH Settings
  ph: {
    sssTableVersion: '2024',
    philhealthRate: 0.015,
    pagibigRate: 0.02,
    taxTableVersion: '2024'
  },

  // System Settings
  system: {
    regularHours: 8,
    otMultiplier: 1.25,
    nightDiffRate: 0.10,
    holidayMultiplier: 2.0,
    restDayMultiplier: 1.3
  }
};
