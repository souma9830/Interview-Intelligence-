const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AuditLog', auditLogSchema);
