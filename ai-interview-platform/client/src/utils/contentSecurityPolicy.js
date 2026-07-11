const REPORT_URI = process.env.REACT_APP_CSP_REPORT_URI || '';

const ContentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'blob:'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    connectSrc: [
      "'self'",
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://www.googleapis.com',
      ...(process.env.REACT_APP_API_URL ? [process.env.REACT_APP_API_URL] : []),
    ],
    frameSrc: ['https://accounts.google.com'],
    mediaSrc: ["'self'", 'blob:'],
    objectSrc: ["'none'"],
    ...(REPORT_URI ? { reportUri: REPORT_URI } : {}),
  },
};

export function getCspMetaTags() {
  const { directives } = ContentSecurityPolicy;
  const metaTags = [];
  Object.entries(directives).forEach(([key, value]) => {
    const name = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const content = Array.isArray(value) ? value.join('; ') : value;
    metaTags.push({ httpEquiv: `Content-Security-Policy-${name}`, content });
  });
  return metaTags;
}

export function logSecurityViolation(violation) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[CSP Violation]', {
      blockedURI: violation.blockedURI,
      violatedDirective: violation.violatedDirective,
      originalPolicy: violation.originalPolicy,
      sourceFile: violation.sourceFile,
      lineNumber: violation.lineNumber,
    });
  }
  if (REPORT_URI) {
    fetch(REPORT_URI, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify({ 'csp-report': violation }),
    }).catch(() => {});
  }
}

export default ContentSecurityPolicy;