const localCache = require('../services/cache/localCache');
describe('Local Cache Service', () => {
  it('should set and get values correctly', () => {
    localCache.set('test_key', 'test_value');
    expect(localCache.get('test_key')).toBe('test_value');
  });
});
