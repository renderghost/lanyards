import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

// The badge's name is the page's largest paint (LCP). Its font is only
// requested once text first renders, which the hero's short wait (#129)
// delays: preloading it lets it download beside the JavaScript instead.
describe('the brand font is preloaded', () => {
  const html = read('index.html');
  const preload = /<link\s+([^>]*rel="preload"[^>]*)\/?>/.exec(html)?.[1];
  const href = preload ? /href="([^"]+)"/.exec(preload)?.[1] : undefined;

  it('preloads one font file as a font, without credentials', () => {
    expect(preload).toBeDefined();
    expect(preload).toMatch(/\bas="font"/);
    expect(preload).toMatch(/\btype="font\/woff2"/);
    // Fonts are fetched in CORS mode: without this the preload is wasted.
    expect(preload).toMatch(/\bcrossorigin\b/);
  });

  it('preloads the Latin file the stylesheet actually uses', () => {
    const css = read(
      'node_modules/@fontsource-variable/rethink-sans/index.css'
    );
    const latin =
      /src: url\(\.\/files\/(rethink-sans-latin-wght-normal\.woff2)\)/.exec(
        css
      )?.[1];
    expect(read('src/styles/index.css')).toContain(
      "@import '@fontsource-variable/rethink-sans';"
    );
    expect(latin).toBeDefined();
    expect(href).toBe(
      `/node_modules/@fontsource-variable/rethink-sans/files/${latin}`
    );
  });
});
