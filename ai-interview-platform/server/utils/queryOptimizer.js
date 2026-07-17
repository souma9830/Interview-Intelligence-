const mongoose = require('mongoose');
const logger = require('../services/logger');

const QueryOptimizer = {
  async getSlowQueries(hours = 24, minDurationMs = 200) {
    try {
      const QueryMetric = mongoose.model('QueryMetric');
      const since = new Date(Date.now() - hours * 3600000);
      return await QueryMetric.find({
        timestamp: { $gte: since },
        durationMs: { $gte: minDurationMs },
      })
        .sort({ durationMs: -1 })
        .limit(100)
        .lean();
    } catch {
      return [];
    }
  },

  async getQuerySummary(hours = 24) {
    try {
      const QueryMetric = mongoose.model('QueryMetric');
      const since = new Date(Date.now() - hours * 3600000);
      return await QueryMetric.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: { model: '$model', operation: '$operation' },
            count: { $sum: 1 },
            avgMs: { $avg: '$durationMs' },
            maxMs: { $max: '$durationMs' },
            minMs: { $min: '$durationMs' },
            slowCount: { $sum: { $cond: ['$slow', 1, 0] } },
          },
        },
        { $sort: { avgMs: -1 } },
      ]);
    } catch {
      return [];
    }
  },

  recommendIndex(pattern) {
    const { model, operation, filter } = pattern;
    if (!filter || typeof filter !== 'object') return null;

    const sortFields = Object.keys(filter).filter(k => !k.startsWith('$'));
    if (sortFields.length === 0) return null;

    return {
      model,
      operation,
      recommendedIndex: sortFields.reduce((acc, f) => ({ ...acc, [f]: 1 }), {}),
      reason: `Frequent ${operation} filter on: ${sortFields.join(', ')}`,
    };
  },

  async profileQuery(model, operation, filter) {
    const start = Date.now();
    let durationMs = 0;
    let errored = false;

    try {
      const result = await (model[operation] && model[operation](filter));
      durationMs = Date.now() - start;
      return { result, durationMs, errored: false };
    } catch (error) {
      durationMs = Date.now() - start;
      errored = true;
      logger.error('Query profiling error', { model: model.modelName, operation, error: error.message });
      throw error;
    }
  },
};

module.exports = QueryOptimizer;