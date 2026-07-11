const logger = require('../services/logger');

const SUPPORTED_VERSIONS = ['1.0', '2.0'];
const DEFAULT_VERSION = '1.0';

const apiVersioning = (req, res, next) => {
  const acceptHeader = req.headers['accept-version'];
  const urlVersion = req.path.match(/^\/api\/v(\d+)/);
  let version = DEFAULT_VERSION;

  if (urlVersion) {
    version = `${urlVersion[1]}.0`;
  } else if (acceptHeader && SUPPORTED_VERSIONS.includes(acceptHeader)) {
    version = acceptHeader;
  }

  req.apiVersion = version;
  res.setHeader('X-API-Version', version);
  res.setHeader('X-API-Deprecated', version === '1.0' ? 'true' : 'false');
  res.setHeader('X-API-Sunset', version === '1.0' ? '2026-12-31' : '');

  next();
};

const requireVersion = (version) => {
  return (req, res, next) => {
    if (req.apiVersion !== version) {
      return res.status(400).json({
        success: false,
        message: `This endpoint requires API version ${version}. Current: ${req.apiVersion}`,
      });
    }
    next();
  };
};

module.exports = { apiVersioning, requireVersion };
