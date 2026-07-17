const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

module.exports = { validate };