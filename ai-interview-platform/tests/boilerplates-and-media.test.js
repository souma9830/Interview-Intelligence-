const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Helper to dynamically load and evaluate an ES module file in a node VM context.
// This allows us to test client ESM files in Jest's CommonJS environment without Babel.
function loadESMAsCommonJS(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  // Transform 'export const Foo' -> 'exports.Foo'
  const transformed = code.replace(/export\s+const\s+(\w+)/g, 'exports.$1');
  const context = { exports: {} };
  vm.createContext(context);
  vm.runInContext(transformed, context);
  return context.exports;
}

describe('boilerplates.js', () => {
  let boilerplatesModule;

  beforeAll(() => {
    const filePath = path.join(__dirname, '../client/src/utils/boilerplates.js');
    boilerplatesModule = loadESMAsCommonJS(filePath);
  });

  it('should export LANGUAGE_BOILERPLATES object', () => {
    expect(boilerplatesModule.LANGUAGE_BOILERPLATES).toBeDefined();
    expect(typeof boilerplatesModule.LANGUAGE_BOILERPLATES).toBe('object');
  });

  it('should contain expected programming languages', () => {
    const languages = Object.keys(boilerplatesModule.LANGUAGE_BOILERPLATES);
    expect(languages).toContain('javascript');
    expect(languages).toContain('python');
    expect(languages).toContain('cpp');
    expect(languages).toContain('java');
  });

  it('should provide boilerplates for all core roles in each language', () => {
    const expectedRoles = [
      'Frontend Engineer',
      'Backend Engineer',
      'Fullstack Engineer',
      'AI / ML Engineer'
    ];

    Object.entries(boilerplatesModule.LANGUAGE_BOILERPLATES).forEach(([lang, data]) => {
      expect(data.ext).toBeDefined();
      expect(data.label).toBeDefined();
      expectedRoles.forEach(role => {
        expect(data[role]).toBeDefined();
        expect(typeof data[role]).toBe('string');
        expect(data[role].length).toBeGreaterThan(50); // Skeletons should be substantial
      });
    });
  });
});

describe('mediaUtils.js', () => {
  let mediaUtilsModule;

  beforeAll(() => {
    const filePath = path.join(__dirname, '../client/src/utils/mediaUtils.js');
    mediaUtilsModule = loadESMAsCommonJS(filePath);
  });

  it('should export getCameraPermission and stopStreamTracks functions', () => {
    expect(typeof mediaUtilsModule.getCameraPermission).toBe('function');
    expect(typeof mediaUtilsModule.stopStreamTracks).toBe('function');
  });

  it('should correctly handle track stopping on active streams', () => {
    const stopMock = jest.fn();
    const trackMock = { stop: stopMock };
    const streamMock = {
      getTracks: () => [trackMock, trackMock]
    };

    mediaUtilsModule.stopStreamTracks(streamMock);
    expect(stopMock).toHaveBeenCalledTimes(2);
  });

  it('should handle null or undefined streams gracefully without throwing errors', () => {
    expect(() => mediaUtilsModule.stopStreamTracks(null)).not.toThrow();
    expect(() => mediaUtilsModule.stopStreamTracks(undefined)).not.toThrow();
  });
});
