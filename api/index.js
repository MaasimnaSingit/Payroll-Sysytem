// Vercel serverless function entry point
// This file is used by Vercel to handle API routes

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import the main server logic
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vercel
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database setup for Vercel
const Database = require('better-sqlite3');
const dbPath = process.env.DB_PATH || '/tmp/payroll_system.db';

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
let db;
try {
  db = new Database(dbPath);
  console.log('Database connected successfully');
  
  // Load schema if database is empty
  const schemaPath = path.join(__dirname, '..', 'server', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database schema loaded');
  }
} catch (error) {
  console.error('Database connection error:', error);
}

// Make database available to routes
app.set('db', db);

// Import and use routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/ph/employees', require('../server/routes/ph_employees'));
app.use('/api/ph/attendance', require('../server/routes/ph_attendance'));
app.use('/api/ph/payroll', require('../server/routes/ph_payroll'));
app.use('/api/ph/leave', require('../server/routes/ph_leave'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Export for Vercel
module.exports = app;
