const crypto = require('crypto');

function generateRouteKey(req) {
  const userId = req.user ? req.user.uid || req.user._id : 'guest';
  const rawStr = `${req.originalUrl || req.url}-${userId}`;
  return crypto.createHash('md5').update(rawStr).digest('hex');
}

module.exports = {
  generateRouteKey,
};
