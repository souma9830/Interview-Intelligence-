const logger = require('../services/logger');

const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_MS) || 200;
const MAX_LOG_LENGTH = parseInt(process.env.QUERY_LOG_SIZE) || 1000;

class QueryProfiler {
  constructor() {
    this.queries = [];
    this.enabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_QUERY_PROFILER === 'true';
  }

  wrapModel(model, name) {
    if (!this.enabled) return model;

    const profiler = this;
    const originalFind = model.find.bind(model);
    const originalFindOne = model.findOne.bind(model);
    const originalFindById = model.findById.bind(model);
    const originalUpdateOne = model.updateOne.bind(model);
    const originalUpdateMany = model.updateMany.bind(model);
    const originalDeleteOne = model.deleteOne.bind(model);
    const originalDeleteMany = model.deleteMany.bind(model);
    const originalAggregate = model.aggregate.bind(model);
    const originalCountDocuments = model.countDocuments.bind(model);

    model.find = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'find', args[0], originalFind(...args));
    };

    model.findOne = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'findOne', args[0], originalFindOne(...args));
    };

    model.findById = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'findById', args[0], originalFindById(...args));
    };

    model.updateOne = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'updateOne', { filter: args[0], update: args[1] }, originalUpdateOne(...args));
    };

    model.updateMany = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'updateMany', { filter: args[0], update: args[1] }, originalUpdateMany(...args));
    };

    model.deleteOne = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'deleteOne', args[0], originalDeleteOne(...args));
    };

    model.deleteMany = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'deleteMany', args[0], originalDeleteMany(...args));
    };

    model.aggregate = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'aggregate', args[0], originalAggregate(...args));
    };

    model.countDocuments = function (...args) {
      return profiler._profileQuery(name || model.modelName, 'countDocuments', args[0], originalCountDocuments(...args));
    };

    return model;
  }

  _profileQuery(modelName, operation, filter, queryPromise) {
    const start = Date.now();
    queryPromise = queryPromise.then
      ? queryPromise
      : (typeof queryPromise.exec === 'function' ? queryPromise.exec() : queryPromise);

    const result = queryPromise
      ? (queryPromise.then
        ? queryPromise.then.bind(queryPromise)
        : (queryPromise.exec ? queryPromise.exec.bind(queryPromise) : null))
      : null;

    if (queryPromise && typeof queryPromise.then === 'function') {
      queryPromise
        .then(() => {
          this._record(modelName, operation, filter, Date.now() - start);
        })
        .catch(() => {
          this._record(modelName, operation, filter, Date.now() - start, true);
        });
    }

    return queryPromise;
  }

  _record(modelName, operation, filter, durationMs, errored = false) {
    const entry = {
      model: modelName,
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      errored,
    };

    if (durationMs > SLOW_QUERY_THRESHOLD) {
      entry.filter = this._sanitizeFilter(filter);
      entry.slow = true;
      logger.warn(`Slow query (${durationMs}ms) on ${modelName}.${operation}`, {
        durationMs,
        model: modelName,
        operation,
        filter: entry.filter,
      });
    }

    this.queries.push(entry);
    if (this.queries.length > MAX_LOG_LENGTH) {
      this.queries.shift();
    }
  }

  _sanitizeFilter(filter) {
    if (!filter) return undefined;
    try {
      return JSON.parse(JSON.stringify(filter, (key, value) => {
        if (key === 'password' || key === 'token' || key === 'secret') return '[REDACTED]';
        return value;
      }));
    } catch {
      return '[Unserializable]';
    }
  }

  getMetrics(hours = 1) {
    const since = Date.now() - (hours * 3600000);
    const recent = this.queries.filter(q => new Date(q.timestamp).getTime() > since);

    const byModel = {};
    const byOperation = {};
    let totalDuration = 0;
    let slowCount = 0;

    recent.forEach(q => {
      byModel[q.model] = byModel[q.model] || { count: 0, totalMs: 0, slowCount: 0 };
      byModel[q.model].count++;
      byModel[q.model].totalMs += q.durationMs;
      if (q.slow) byModel[q.model].slowCount++;

      byOperation[q.operation] = byOperation[q.operation] || { count: 0, totalMs: 0 };
      byOperation[q.operation].count++;
      byOperation[q.operation].totalMs += q.durationMs;

      totalDuration += q.durationMs;
      if (q.slow) slowCount++;
    });

    return {
      totalQueries: recent.length,
      totalDurationMs: totalDuration,
      avgDurationMs: recent.length ? Math.round(totalDuration / recent.length) : 0,
      slowQueries: slowCount,
      slowThresholdMs: SLOW_QUERY_THRESHOLD,
      byModel,
      byOperation,
    };
  }

  clearMetrics() {
    this.queries = [];
  }
}

const queryProfiler = new QueryProfiler();
module.exports = queryProfiler;