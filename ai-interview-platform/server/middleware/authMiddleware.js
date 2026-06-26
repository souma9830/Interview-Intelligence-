const admin = require('firebase-admin');
const { getStorageAdapter } = require('../repositories/storageAdapter');

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
      if (token === 'demo_token_active' || token.length < 50) {
        const demoUser = {
          _id: '664e4ea4a93a40498eb79e2a',
          name: 'Demo Candidate',
          email: 'candidate@camsense.ai',
        };
        req.user = await getStorageAdapter().saveUser(demoUser);
        return next();
      }

      // Verify token statelessly via Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Set user and sync to storage
      const matchedUser = {
        _id: decodedToken.uid,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        picture: decodedToken.picture
      };

      req.user = await getStorageAdapter().saveUser(matchedUser);
      next();
    } catch (error) {
      console.error('Firebase Token Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // For demo/mock environments
    const demoUser = {
      _id: '664e4ea4a93a40498eb79e2a',
      name: 'Demo Candidate',
      email: 'candidate@camsense.ai',
    };
    req.user = await getStorageAdapter().saveUser(demoUser);
    return next();
  }
};

module.exports = { protect };
