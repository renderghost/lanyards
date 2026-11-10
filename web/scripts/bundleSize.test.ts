import { gzipSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import {
  gzipSize,
  INITIAL_JS_BUDGET_BYTES,
  initialJsFiles,
} from './bundleSize';

describe('initialJsFiles', () => {
  it('includes the entry and its static imports, not lazy chunks', () => {
    const manifest = {
      'index.html': {
        file: 'assets/index.js',
        isEntry: true,
        imports: ['_vendor.js'],
        dynamicImports: ['src/routes/settings.tsx'],
      },
      '_vendor.js': { file: 'assets/vendor.js' },
      'src/routes/settings.tsx': {
        file: 'assets/settings.js',
        isDynamicEntry: true,
      },
    };
    expect(initialJsFiles(manifest)).toEqual([
      'assets/index.js',
      'assets/vendor.js',
    ]);
  });

  it('follows nested imports once each', () => {
    const manifest = {
      'index.html': {
        file: 'assets/index.js',
        isEntry: true,
        imports: ['_a.js', '_b.js'],
      },
      '_a.js': { file: 'assets/a.js', imports: ['_shared.js'] },
      '_b.js': { file: 'assets/b.js', imports: ['_shared.js'] },
      '_shared.js': { file: 'assets/shared.js' },
    };
    expect(initialJsFiles(manifest)).toEqual([
      'assets/index.js',
      'assets/a.js',
      'assets/shared.js',
      'assets/b.js',
    ]);
  });

  it('fails clearly when there is no HTML entry', () => {
    expect(() => initialJsFiles({})).toThrow('index.html');
  });
});

describe('gzipSize', () => {
  it('measures the maximum-compression gzip size', () => {
    const contents = Buffer.from('lanyards '.repeat(500));
    expect(gzipSize(contents)).toBe(gzipSync(contents, { level: 9 }).length);
  });
});

describe('budget', () => {
  it('is 200 KB of gzipped JavaScript', () => {
    expect(INITIAL_JS_BUDGET_BYTES).toBe(204800);
  });
});
