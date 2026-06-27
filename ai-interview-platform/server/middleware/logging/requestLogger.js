const crypto = require('crypto');

/**
 * Custom HTTP Request Logging Middleware
 * ──────────────────────────────────────
 * Logs incoming HTTP request details (method, path, status, latency)
 * and attaches unique correlation IDs (X-Request-ID) for diagnostic tracing.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Inject unique request tracing correlation ID
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Wait for response to finish to capture status and calculate duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log format: [TIMESTAMP] [REQUEST_ID] IP - METHOD PATH - STATUS_CODE - DURATIONms
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] [ReqID: ${requestId}] ${ip} - ${method} ${originalUrl} - ${statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
