// Vercel serverless function for authentication
const express = require('express');
const bcrypt = require('bcryptjs');
const { signJwt } = require('../server/middleware/auth');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Database setup for Vercel
const dbPath = process.env.DB_PATH || '/tmp/payroll_system.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
try {
  db = new Database(dbPath);
  
  // Load schema if database is empty
  const schemaPath = path.join(__dirname, '..', 'server', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
} catch (error) {
  console.error('Database connection error:', error);
}

// Login endpoint
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username & password required' });
    }
    
    const user = db.prepare(`SELECT id, username, password, role, employee_id FROM users WHERE username=?`).get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const payload = { id: user.id, username: user.username, role: user.role, employee_id: user.employee_id };
    const token = signJwt(payload);
    
    res.json({ 
      success: true,
      token, 
      user: payload 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Me endpoint
app.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    res.json({ user: decoded });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
