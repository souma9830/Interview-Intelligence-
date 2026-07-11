const ApiVersionHandler = require('../utils/apiVersionHandler');

const responseStandardizer = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (body && typeof body === 'object' && !body._meta) {
      const version = req.apiVersion || '1.0';
      body._meta = {
        version,
        deprecated: ApiVersionHandler.isDeprecated(version),
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        ...(ApiVersionHandler.isDeprecated(version) && {
          sunset: ApiVersionHandler.getSunsetDate(version),
          migration: ApiVersionHandler.getMigrationGuide(version),
        }),
      };
    }
    return originalJson(body);
  };
  next();
};

module.exports = responseStandardizer;
