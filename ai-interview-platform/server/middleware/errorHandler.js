/**
 * Centralized Express Error-Handling Middleware
 * ─────────────────────────────────────────────
 * Catches all unhandled errors thrown or forwarded via next(err) across
 * every route and middleware in the application.
 *
 * Design goals:
 *   1. Never expose raw stack traces or internal paths to the client.
 *   2. Always return a consistent JSON response shape.
 *   3. Log enough context for effective server-side debugging.
 *   4. Differentiate operational errors (bad input, auth failures)
 *      from programmer errors (unhandled exceptions).
 */

/**
 * Handles requests that do not match any registered route.
 * Mounted after all route handlers so it only fires for truly unknown paths.
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error-catching middleware.
 * Express identifies this as an error handler because it has four parameters.
 *
 * @param {Error}    err  — the error object thrown or passed via next(err)
 * @param {Request}  req  — Express request
 * @param {Response} res  — Express response
 * @param {Function} next — Express next (unused, but required for signature)
 */
const globalErrorHandler = (err, req, res, _next) => {
  // Determine the appropriate HTTP status code
  const statusCode = err.status || err.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Build a structured log entry for observability
  const logPayload = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    ...(req.user && { userId: req.user._id }),
    ...(req.ip && { clientIp: req.ip }),
  };

  if (isServerError) {
    // Server errors warrant full stack trace logging for post-mortem
    console.error('[ErrorHandler] Unhandled server error:', logPayload);
    if (err.stack) {
      console.error(err.stack);
    }
  } else {
    // Client / operational errors are logged at warn level
    console.warn('[ErrorHandler] Client error:', logPayload);
  }

  // Construct the response body
  const responseBody = {
    success: false,
    message: isServerError ? 'Internal Server Error' : (err.message || 'An error occurred'),
  };

  // In development, attach extra debug information
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
    responseBody.details = err.details || undefined;
  }

  // Prevent double-sending if headers were already flushed
  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = { notFoundHandler, globalErrorHandler };
