const crypto = require('crypto');

const SELF = "'self'";
const NONE = "'none'";

const CSP_DIRECTIVES = {
  defaultSrc: [SELF],
  scriptSrc: [SELF, "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://www.gstatic.com'],
  styleSrc: [SELF, "'unsafe-inline'", 'https://fonts.googleapis.com'],
  imgSrc: [SELF, 'data:', 'blob:'],
  fontSrc: [SELF, 'https://fonts.gstatic.com', 'data:'],
  connectSrc: [SELF, 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://www.googleapis.com'],
  frameSrc: ['https://accounts.google.com'],
  objectSrc: [NONE],
  mediaSrc: [SELF, 'blob:'],
  workerSrc: [SELF, 'blob:'],
  formAction: [SELF],
  baseUri: [SELF],
  upgradeInsecureRequests: true,
};

function buildCSPString(directives) {
  return Object.entries(directives)
    .map(([key, value]) => {
      const headerName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const values = Array.isArray(value) ? value.join(' ') : value;
      return `${headerName} ${values}`;
    })
    .join('; ');
}

const getCSPNonce = () => crypto.randomBytes(16).toString('base64');

const securityHeaders = (req, res, next) => {
  const nonce = getCSPNonce();
  res.locals.cspNonce = nonce;

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), fullscreen=(self), display-capture=(self)');

  const cspDirectives = {
    ...CSP_DIRECTIVES,
    scriptSrc: [...CSP_DIRECTIVES.scriptSrc, `'nonce-${nonce}'`],
  };
  res.setHeader('Content-Security-Policy', buildCSPString(cspDirectives));

  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  res.removeHeader('X-Powered-By');

  next();
};

module.exports = { securityHeaders, buildCSPString, CSP_DIRECTIVES };