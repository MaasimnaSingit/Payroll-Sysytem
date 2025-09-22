// Shared authentication utility for Vercel serverless functions
const jwt = require('jsonwebtoken');

function signJwt(payload) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.verify(token, secret);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signJwt, verifyToken, authenticateToken };
