const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Bypass for demo token
      if (token === 'demo_token_active') {
        req.user = {
          _id: '664e4ea4a93a40498eb79e2a',
          name: 'Demo Candidate',
          email: 'candidate@camsense.ai',
        };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      // Fallback if Mongoose is simulating/in-memory or if user is mock
      if (!req.user) {
        req.user = {
          _id: decoded.id || '664e4ea4a93a40498eb79e2a',
          name: 'Demo Candidate',
          email: 'candidate@camsense.ai',
        };
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // For demo/mock environments, if authorization header is missing, we can bind a mock user to ensure frontend compatibility
    if (process.env.NODE_ENV === 'development' || !process.env.MONGO_URI) {
      req.user = {
        _id: '664e4ea4a93a40498eb79e2a',
        name: 'Demo Candidate',
        email: 'candidate@camsense.ai',
      };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
