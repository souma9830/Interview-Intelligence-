const crypto = require('crypto');

const SELF = "'self'";
const NONE = "'none'";

const CSP_DIRECTIVES = {
  defaultSrc: [SELF],
  scriptSrc: [SELF, "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://www.gstatic.com'],
  styleSrc: [SELF, "'unsafe-inline'", 'https://fonts.googleapis.com'],
  imgSrc: [SELF, 'data:', 'blob:'],
  fontSrc: [SELF, 'https://fonts.gstatic.com', 'data:'],
  connectSrc: [
    SELF,
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.googleapis.com',
  ],
  frameSrc: ['https://accounts.google.com'],
  objectSrc: [NONE],
  mediaSrc: [SELF, 'blob:'],
  workerSrc: [SELF, 'blob:'],
  formAction: [SELF],
  baseUri: [SELF],
  upgradeInsecureRequests: [],
};

const REPORT_URI = process.env.CSP_REPORT_URI || '';
if (REPORT_URI) {
  CSP_DIRECTIVES.reportUri = REPORT_URI;
}

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

function buildCSPString(directives) {
  return Object.entries(directives).map(([key, value]) => {
    const headerName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const values = Array.isArray(value) ? value.join(' ') : value;
    return `${headerName} ${values}`;
  }).join('; ');
}

function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

function corsOptions(origin, callback) {
  if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(null, false);
  }
}

module.exports = {
  CSP_DIRECTIVES,
  buildCSPString,
  generateNonce,
  corsOptions,
  ALLOWED_ORIGINS,
  corsConfig: {
    origin: corsOptions,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};
