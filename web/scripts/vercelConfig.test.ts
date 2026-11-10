import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

type Config = {
  functions?: Record<string, { includeFiles?: string }>;
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
) as Config;

describe('vercel.json', () => {
  it('sends lanyard and image paths to the preview functions before the app', () => {
    expect(config.rewrites).toEqual([
      { source: '/@:handle', destination: '/api/meta?handle=:handle' },
      { source: '/d/:did', destination: '/api/meta?did=:did' },
      { source: '/og/p/:did.png', destination: '/api/og?did=:did' },
      { source: '/og/default.png', destination: '/api/og' },
      { source: '/((?!api/).*)', destination: '/index.html' },
    ]);
  });

  it('bundles the files each preview function reads at runtime', () => {
    expect(config.functions?.['api/meta.ts']?.includeFiles).toBe(
      'dist/index.html'
    );
    const og = config.functions?.['api/og.ts']?.includeFiles ?? '';
    expect(globSync(og).sort()).toEqual([
      'node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2',
      'node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2',
      'node_modules/@resvg/resvg-wasm/index_bg.wasm',
    ]);
  });

  it('sets security headers on every response', () => {
    const all = config.headers.find((entry) => entry.source === '/(.*)');
    expect(all?.headers).toEqual(
      expect.arrayContaining([
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ])
    );
  });
});
