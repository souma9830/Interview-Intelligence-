const { deepSanitize, BLOCKED_OPERATORS } = require('../../middleware/sanitizeMiddleware');
const QuerySanitizer = require('../../utils/querySanitizer');

describe('Sanitize Middleware', () => {
  describe('deepSanitize', () => {
    it('should replace $where operator', () => {
      const input = { $where: '1==1', name: 'test' };
      const result = deepSanitize(input);
      expect(result).toHaveProperty('_$where');
      expect(result).not.toHaveProperty('$where');
      expect(result.name).toBe('test');
    });

    it('should replace $gt operator', () => {
      const input = { age: { $gt: 18 } };
      const result = deepSanitize(input);
      expect(result.age).toHaveProperty('_$gt');
      expect(result.age).not.toHaveProperty('$gt');
      expect(result.age._$gt).toBe(18);
    });

    it('should handle nested objects recursively', () => {
      const input = { user: { $regex: '.*', $options: 'i' } };
      const result = deepSanitize(input);
      expect(result.user).toHaveProperty('_$regex');
      expect(result.user).toHaveProperty('_$options');
    });

    it('should handle arrays', () => {
      const input = [{ $ne: null }, { name: 'test' }];
      const result = deepSanitize(input);
      expect(result[0]).toHaveProperty('_$ne');
      expect(result[1].name).toBe('test');
    });

    it('should return primitives unchanged', () => {
      expect(deepSanitize(null)).toBeNull();
      expect(deepSanitize(42)).toBe(42);
      expect(deepSanitize('string')).toBe('string');
    });

    it('should replace all blocked operators', () => {
      const input = {};
      BLOCKED_OPERATORS.forEach(op => { input[op] = 'test'; });
      const result = deepSanitize(input);
      BLOCKED_OPERATORS.forEach(op => {
        expect(result).toHaveProperty(`_${op}`);
        expect(result).not.toHaveProperty(op);
      });
    });
  });

  describe('QuerySanitizer', () => {
    it('should sanitize filter objects', () => {
      const filter = QuerySanitizer.sanitizeFilter({ $where: '1', role: 'admin' });
      expect(filter).toHaveProperty('_$where');
      expect(filter.role).toBe('admin');
    });

    it('should sanitize update operators', () => {
      const update = QuerySanitizer.sanitizeUpdate({ $set: { name: 'test' }, $inc: { views: 1 } });
      expect(update).toHaveProperty('$set');
      expect(update).toHaveProperty('$inc');
    });

    it('should strip all operators from objects', () => {
      const result = QuerySanitizer.stripOperators({ $gt: 5, $ne: 10, name: 'test' });
      expect(result).not.toHaveProperty('$gt');
      expect(result).not.toHaveProperty('$ne');
      expect(result.name).toBe('test');
    });

    it('should detect injection patterns in strings', () => {
      expect(QuerySanitizer.hasInjectionPatterns('{ $gt: 1 }')).toBe(true);
      expect(QuerySanitizer.hasInjectionPatterns('normal string')).toBe(false);
      expect(QuerySanitizer.hasInjectionPatterns('$where')).toBe(true);
      expect(QuerySanitizer.hasInjectionPatterns('eval(something)')).toBe(true);
    });

    it('should sanitize aggregation pipeline', () => {
      const pipeline = QuerySanitizer.sanitizeAggregation([
        { $match: { $where: '1', status: 'active' } },
        { $group: { _id: '$status' } },
      ]);
      expect(pipeline[0].$match).toHaveProperty('_$where');
      expect(pipeline[0].$match.status).toBe('active');
    });
  });
});