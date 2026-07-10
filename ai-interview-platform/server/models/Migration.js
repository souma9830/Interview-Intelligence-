const mongoose = require('mongoose');

const MigrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  batch: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Migration', MigrationSchema);