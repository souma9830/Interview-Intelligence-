const queryProfiler = require('../services/queryProfiler');
const queryOptimizer = require('../utils/queryOptimizer');

describe('QueryProfiler', () => {
  beforeEach(() => {
    queryProfiler.clearMetrics();
  });

  it('should have initial empty metrics', () => {
    const metrics = queryProfiler.getMetrics();
    expect(metrics.totalQueries).toBe(0);
  });

  it('should record and retrieve query metrics', () => {
    const mockModel = { modelName: 'User' };

    queryProfiler._record('User', 'find', { email: 'test@test.com' }, 50);
    queryProfiler._record('User', 'findOne', { _id: 'abc' }, 120);
    queryProfiler._record('Interview', 'find', { status: 'active' }, 350);

    const metrics = queryProfiler.getMetrics(1);
    expect(metrics.totalQueries).toBe(3);
    expect(metrics.totalDurationMs).toBe(520);
    expect(metrics.avgDurationMs).toBe(173);
    expect(metrics.slowQueries).toBe(1);
  });

  it('should group metrics by model', () => {
    queryProfiler._record('User', 'find', {}, 30);
    queryProfiler._record('User', 'findOne', {}, 20);
    queryProfiler._record('Interview', 'find', {}, 100);

    const metrics = queryProfiler.getMetrics(1);
    expect(metrics.byModel.User.count).toBe(2);
    expect(metrics.byModel.Interview.count).toBe(1);
  });

  it('should group metrics by operation', () => {
    queryProfiler._record('User', 'find', {}, 30);
    queryProfiler._record('User', 'findOne', {}, 20);

    const metrics = queryProfiler.getMetrics(1);
    expect(metrics.byOperation.find.count).toBe(1);
    expect(metrics.byOperation.findOne.count).toBe(1);
  });

  it('should clear metrics', () => {
    queryProfiler._record('User', 'find', {}, 30);
    queryProfiler.clearMetrics();
    const metrics = queryProfiler.getMetrics();
    expect(metrics.totalQueries).toBe(0);
  });

  it('should respect hours filter', () => {
    queryProfiler._record('User', 'find', {}, 30);
    const metrics = queryProfiler.getMetrics(0);
    expect(metrics.totalQueries).toBe(0);
  });

  it('should detect slow queries', () => {
    queryProfiler._record('User', 'find', {}, 50);
    queryProfiler._record('Interview', 'find', {}, 350);

    const metrics = queryProfiler.getMetrics();
    expect(metrics.slowQueries).toBe(1);
  });
});

describe('QueryOptimizer', () => {
  describe('recommendIndex', () => {
    it('should recommend index for simple filter', () => {
      const result = queryOptimizer.recommendIndex({
        model: 'User',
        operation: 'find',
        filter: { email: 'test@test.com', status: 'active' },
      });
      expect(result).toBeDefined();
      expect(result.recommendedIndex).toEqual({ email: 1, status: 1 });
    });

    it('should return null for empty filter', () => {
      const result = queryOptimizer.recommendIndex({
        model: 'User',
        operation: 'find',
        filter: {},
      });
      expect(result).toBeNull();
    });

    it('should return null for null filter', () => {
      const result = queryOptimizer.recommendIndex({
        model: 'User',
        operation: 'find',
        filter: null,
      });
      expect(result).toBeNull();
    });
  });
});