exports.validateCodePayload = (req, res, next) => {
  const { code } = req.body;
  
  if (code && typeof code === 'string') {
    // Prevent dangerous code imports in VM/sandbox
    if (code.includes('require("child_process")') || code.includes('process.exit')) {
      return res.status(403).json({ success: false, message: 'Malicious pattern detected in submission' });
    }
  }

  next();
};
