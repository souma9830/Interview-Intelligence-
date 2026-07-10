const admin = require('firebase-admin');
const logger = require('../services/logger');
const User = require('../models/User');

const syncFirebaseUserToMongoDB = async (firebaseUser) => {
  try {
    if (!firebaseUser || !firebaseUser.email) return null;

    const email = firebaseUser.email.toLowerCase().trim();

    let mongoUser = await User.findOne({ email });

    if (!mongoUser && firebaseUser.uid) {
      mongoUser = await User.findOne({ firebaseUid: firebaseUser.uid });
    }

    if (!mongoUser) {
      mongoUser = await User.create({
        name: firebaseUser.name || email.split('@')[0] || 'User',
        email,
        firebaseUid: firebaseUser.uid,
        password: `fb_${firebaseUser.uid}_${Date.now()}`,
      });
      console.log(`[Auth Sync] Auto-created MongoDB user for Firebase user: ${email}`);
    } else if (!mongoUser.firebaseUid && firebaseUser.uid) {
      mongoUser.firebaseUid = firebaseUser.uid;
      await mongoUser.save();
      console.log(`[Auth Sync] Linked firebaseUid to existing MongoDB user: ${email}`);
    }

    return mongoUser;
  } catch (err) {
    if (err.code === 11000) {
      console.warn(`[Auth Sync] Duplicate key handled for: ${firebaseUser?.email}`);
      return await User.findOne({ email: firebaseUser?.email?.toLowerCase().trim() });
    }
    console.error('[Auth Sync] Error:', err.message);
    return null;
  }
};

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    const token = authHeader.split(' ')[1];
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEMO_TOKEN === 'true' && token === 'demo_token_active') {
      logger.warn('Demo token accepted in development mode.');
      req.user = { uid: 'demo_uid', _id: 'demo_uid', role: 'admin' };
      return next();
    }
    const decoded = await admin.auth().verifyIdToken(token);
    const userData = { ...decoded, _id: decoded.uid };
    req.user = userData;

    syncFirebaseUserToMongoDB(decoded).then(mongoUser => {
      if (mongoUser) {
        req.mongoUser = mongoUser;
      }
    }).catch(err => {
      console.error('[Auth] Background sync failed:', err.message);
    });

    req.user = { ...decoded, _id: decoded.uid };
    req.userId = decoded.uid;
    syncFirebaseUserToMongoDB(decoded);
    next();
  } catch (err) {
    logger.error('Token verification failed', { error: err.message });
    res.status(401).json({ success: false, message: 'Authentication failed. Invalid or expired token.' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Access denied: Administrators only' });
};

module.exports.syncFirebaseUserToMongoDB = syncFirebaseUserToMongoDB;