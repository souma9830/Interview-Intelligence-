/**
 * Custom HTTP Request Logging Middleware
 * ──────────────────────────────────────
 * Logs incoming HTTP request details (method, path, status, latency)
 * without bringing in external dependencies like morgan.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Wait for response to finish to capture status and calculate duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log format: [TIMESTAMP] IP - METHOD PATH - STATUS_CODE - DURATIONms
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${ip} - ${method} ${originalUrl} - ${statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
