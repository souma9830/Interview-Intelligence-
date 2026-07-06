const LocalCache = require('../services/cache/localCache');
const localCache = new LocalCache();
describe('Local Cache Service', () => {
  it('should set and get values correctly', () => {
    localCache.set('test_key', 'test_value');
    expect(localCache.get('test_key')).toBe('test_value');
  });
});
