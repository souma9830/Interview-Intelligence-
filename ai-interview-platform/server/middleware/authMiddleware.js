const admin = require('firebase-admin');

/**
 * Determines if the application is running in a non-production environment.
 * Checks NODE_ENV explicitly — defaults to false when the variable is absent
 * so that misconfigured deploys never silently downgrade to demo mode.
 */
const isDevelopment = () => {
  const env = (process.env.NODE_ENV || '').toLowerCase().trim();
  return env === 'development' || env === 'test';
};

/**
 * Demo / sandbox user profile returned when the middleware operates
 * in development bypass mode.  Centralised here so every code path
 * that needs it references the same object shape.
 */
const DEMO_USER_PROFILE = Object.freeze({
  _id: '664e4ea4a93a40498eb79e2a',
  name: 'Demo Candidate',
  email: 'candidate@camsense.ai',
});

/**
 * Express middleware that validates Firebase ID tokens carried in the
 * Authorization header (Bearer scheme).
 *
 * Security model
 * ──────────────
 * • Production  — every request MUST carry a valid Firebase JWT.
 * • Development — a hard-coded demo token (`demo_token_active`) is
 *                 accepted so that developers can test client flows
 *                 without burning Firebase quota.  The old "token.length < 50"
 *                 shortcut has been removed because it allowed trivial
 *                 auth bypass in any environment.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No Authorization header at all — allow demo passthrough only in dev
    if (isDevelopment()) {
      req.user = { ...DEMO_USER_PROFILE };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, malformed authorization header',
    });
  }

  // Development-only: accept the known demo sentinel value
  if (token === 'demo_token_active' && isDevelopment()) {
    req.user = { ...DEMO_USER_PROFILE };
    return next();
  }

  // ── Firebase JWT verification (production & development) ──────────
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      _id: decodedToken.uid,
      name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User'),
      email: decodedToken.email || '',
      picture: decodedToken.picture || '',
    };

    return next();
  } catch (error) {
    // Differentiate expired tokens from malformed ones for the client
    const isExpired = error.code === 'auth/id-token-expired';
    const statusCode = isExpired ? 401 : 403;
    const clientMessage = isExpired
      ? 'Session expired. Please sign in again.'
      : 'Not authorized, token verification failed';

    console.error(
      `[Auth] Token verification failed — code: ${error.code || 'unknown'}, ` +
      `message: ${error.message}, ip: ${req.ip}`
    );

    return res.status(statusCode).json({
      success: false,
      message: clientMessage,
    });
  }
};

module.exports = { protect };
