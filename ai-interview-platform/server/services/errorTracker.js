const ErrorLog = require('../models/ErrorLog');
const logger = require('./logger');

class ErrorTracker {
  static async capture(error, context = {}) {
    try {
      const entry = {
        level: context.level || 'error',
        message: error.message || 'Unknown error',
        stack: error.stack,
        code: error.statusCode || error.status || 500,
        path: context.path,
        method: context.method,
        userId: context.userId,
        requestId: context.requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        metadata: context.metadata || {},
      };

      await ErrorLog.create(entry);

      if (entry.level === 'error') {
        logger.error(`[ErrorTracker] Captured error: ${entry.message}`, {
          errorId: entry._id,
          path: entry.path,
          userId: entry.userId,
        });
      }

      return entry;
    } catch (dbErr) {
      logger.error('[ErrorTracker] Failed to persist error', { error: dbErr.message });
      return null;
    }
  }

  static async list(filters = {}) {
    const query = {};
    if (filters.level) query.level = filters.level;
    if (filters.resolved !== undefined) query.resolved = filters.resolved;
    if (filters.path) query.path = new RegExp(filters.path, 'i');
    if (filters.userId) query.userId = filters.userId;

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ErrorLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ErrorLog.countDocuments(query),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async resolve(id, resolvedBy) {
    return ErrorLog.findByIdAndUpdate(id, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: resolvedBy || 'system',
    }, { new: true });
  }

  static async getStats(timeframeHours = 24) {
    const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    const stats = await ErrorLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: '$level',
        count: { $sum: 1 },
        paths: { $addToSet: '$path' },
      }},
    ]);
    const total = stats.reduce((acc, s) => acc + s.count, 0);
    return {
      total,
      since,
      byLevel: stats,
      unresolved: await ErrorLog.countDocuments({ resolved: false }),
    };
  }
}

module.exports = ErrorTracker;