const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
