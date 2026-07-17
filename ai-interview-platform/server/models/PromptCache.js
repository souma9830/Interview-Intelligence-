const mongoose = require('mongoose');

const PromptCacheSchema = new mongoose.Schema({
  promptHash: {
    type: String,
    required: true,
    unique: true
  },
  responseJson: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // TTL Index of 1 hour
  }
});

module.exports = mongoose.model('PromptCache', PromptCacheSchema);
