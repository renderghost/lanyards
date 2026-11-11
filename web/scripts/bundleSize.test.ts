import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import {
  gzipSize,
  INITIAL_JS_BUDGET_BYTES,
  initialJsFiles,
  PUBLIC_LANYARD_ROUTES,
  routeSizes,
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

  it('also counts the chunks of the named lazy routes and their imports', () => {
    const manifest = {
      'index.html': {
        file: 'assets/index.js',
        isEntry: true,
        imports: ['_session.js'],
        dynamicImports: [
          'src/routes/@{$handle}.tsx?tsr-split=component',
          'src/routes/settings.tsx?tsr-split=component',
        ],
      },
      '_session.js': { file: 'assets/session.js' },
      'src/routes/@{$handle}.tsx?tsr-split=component': {
        file: 'assets/handle.js',
        isDynamicEntry: true,
        imports: ['_LanyardPage.js', 'index.html', '_session.js'],
      },
      '_LanyardPage.js': { file: 'assets/LanyardPage.js' },
      'src/routes/settings.tsx?tsr-split=component': {
        file: 'assets/settings.js',
        isDynamicEntry: true,
      },
    };
    expect(initialJsFiles(manifest, ['routes/@{$handle}.tsx'])).toEqual([
      'assets/index.js',
      'assets/session.js',
      'assets/handle.js',
      'assets/LanyardPage.js',
    ]);
  });

  it('fails clearly when a named route is missing from the build', () => {
    expect(() =>
      initialJsFiles(
        { 'index.html': { file: 'assets/index.js', isEntry: true } },
        ['routes/@{$handle}.tsx']
      )
    ).toThrow('routes/@{$handle}.tsx');
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

describe('routeSizes', () => {
  it('measures each route on its own, counting shared chunks for each', () => {
    const manifest = {
      'index.html': { file: 'assets/index.js', isEntry: true },
      'src/routes/@{$handle}.tsx?tsr-split=component': {
        file: 'assets/handle.js',
        imports: ['_LanyardPage.js'],
      },
      'src/routes/d.$did.tsx?tsr-split=component': {
        file: 'assets/did.js',
        imports: ['_LanyardPage.js'],
      },
      '_LanyardPage.js': { file: 'assets/LanyardPage.js' },
    };
    const sizes: Record<string, number> = {
      'assets/index.js': 100,
      'assets/handle.js': 10,
      'assets/did.js': 20,
      'assets/LanyardPage.js': 50,
    };
    expect(
      routeSizes(
        manifest,
        ['routes/@{$handle}.tsx', 'routes/d.$did.tsx'],
        (file) => sizes[file] ?? 0
      )
    ).toEqual([
      {
        route: 'routes/@{$handle}.tsx',
        files: ['assets/index.js', 'assets/handle.js', 'assets/LanyardPage.js'],
        total: 160,
      },
      {
        route: 'routes/d.$did.tsx',
        files: ['assets/index.js', 'assets/did.js', 'assets/LanyardPage.js'],
        total: 170,
      },
    ]);
  });

  // Spec §2's budget is for the public lanyard, whichever URL opens it.
  it('covers every route that shows a public lanyard', () => {
    const lanyardRoutes = readdirSync('src/routes')
      .filter((name) => /\.tsx$/.test(name) && !name.includes('.test.'))
      .filter((name) =>
        readFileSync(`src/routes/${name}`, 'utf8').includes('LanyardPage')
      )
      .map((name) => `routes/${name}`)
      .sort();
    expect(lanyardRoutes.length).toBeGreaterThan(0);
    expect([...PUBLIC_LANYARD_ROUTES].sort()).toEqual(lanyardRoutes);
  });
});
