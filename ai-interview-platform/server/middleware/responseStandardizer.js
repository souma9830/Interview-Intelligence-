/**
 * Response Standardization Middleware
 *
 * Ensures all API responses follow a consistent envelope format.
 * Applied as middleware to normalize response structure.
 */

const RESPONSE_VERSION = '1.0';

function responseStandardizer(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (body && typeof body === 'object' && !body._standardized) {
      const standardized = {
        ...body,
        _meta: {
          version: RESPONSE_VERSION,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          method: req.method,
        },
      };
      standardized._standardized = true;
      return originalJson(standardized);
    }
    return originalJson(body);
  };

  next();
}

module.exports = { responseStandardizer };
