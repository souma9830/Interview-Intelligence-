const cacheManager = require('../services/cache/cacheManager');
const { generateRouteKey } = require('../utils/cacheKeys');

function routeCacheMiddleware(ttlSeconds = 60) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = generateRouteKey(req);
    const cachedData = cacheManager.get(key);

    if (cachedData) {
      console.log(`[Route Cache] Cache hit for key: ${key}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Override res.json to capture response payload
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode === 200 && body && body.success) {
        console.log(`[Route Cache] Caching response for key: ${key}`);
        cacheManager.set(key, JSON.stringify(body), ttlSeconds * 1000);
      }
      return originalJson.call(this, body);
    };

    next();
  };
}

module.exports = {
  routeCacheMiddleware,
};
