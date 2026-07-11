exports.validateCodePayload = (req, res, next) => {
  const { code, language } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid or missing code payload' });
  }
  
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid or missing language payload' });
  }

  // Prevent dangerous code imports in VM/sandbox
  if (code.includes('require("child_process")') || code.includes('process.exit')) {
    return res.status(403).json({ success: false, message: 'Malicious pattern detected in submission' });
  }

  next();
};
