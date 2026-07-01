
const admin = require('firebase-admin');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    const token = authHeader.split(' ')[1];
    // In development mode, accept dummy token
    if (process.env.NODE_ENV === 'development' && token === 'demo_token_active') {
      req.user = { uid: 'demo_uid', role: 'admin' };
      return next();
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Access denied: Administrators only' });
};
      