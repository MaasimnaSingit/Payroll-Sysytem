const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'change-me';

function authOptional(req, _res, next){
  const m = /^Bearer\s+(.+)$/.exec(req.headers.authorization || '');
  if (m) { try { req.user = jwt.verify(m[1], SECRET); } catch {} }
  next();
}
function authRequired(req,res,next){
  authOptional(req,res,()=> req.user ? next() : res.status(401).json({error:'Unauthorized'}));
}
function requireRole(...roles){
  return (req,res,next)=> !req.user ? res.status(401).json({error:'Unauthorized'})
    : roles.includes(req.user.role) || (req.user.role === 'admin' && roles.includes('ADMIN_HR')) ? next() : res.status(403).json({error:'Forbidden'});
}
function signJwt(u){
  return jwt.sign({
    uid:u.id, role:u.role, employee_id:u.employee_id||null, username:u.username,
    must_change_password: !!u.must_change_password,
  }, SECRET, { expiresIn:'12h' });
}
module.exports = { authOptional, authRequired, requireRole, signJwt };


