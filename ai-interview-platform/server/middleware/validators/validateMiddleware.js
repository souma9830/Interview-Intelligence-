const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }));
    
    // Bubble up first error message to main message property to support test assertions
    const customMessage = formatted.length > 0 ? formatted[0].message : 'Validation failed';

    return res.status(400).json({
      success: false,
      message: customMessage,
      errors: formatted,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

module.exports = { validate };