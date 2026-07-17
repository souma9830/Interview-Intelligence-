const mongoose = require('mongoose');

const queryMetricSchema = new mongoose.Schema({
  model: { type: String, required: true },
  operation: { type: String, required: true },
  durationMs: { type: Number, required: true },
  slow: { type: Boolean, default: false },
  filter: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  errored: { type: Boolean, default: false },
});

queryMetricSchema.index({ timestamp: -1 });
queryMetricSchema.index({ slow: 1, timestamp: -1 });
queryMetricSchema.index({ model: 1, operation: 1 });

module.exports = mongoose.model('QueryMetric', queryMetricSchema);