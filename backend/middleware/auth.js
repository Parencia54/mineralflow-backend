const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function auth(roleArray = []) {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ','');
    if(!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if(roleArray.length && !roleArray.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch(err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

module.exports = auth;
