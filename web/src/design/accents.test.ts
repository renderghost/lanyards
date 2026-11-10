import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readCssVars } from '@/test/cssVars';

import { ACCENTS, applyAccent, DEFAULT_ACCENT } from './accents';
import { contrastRatio } from './contrast';

// Vitest runs from web/; import.meta.url is not a file URL under jsdom.
const read = (file: string) =>
  readFileSync(resolve(process.cwd(), 'src/styles', file), 'utf8');

const DARK = '(prefers-color-scheme: dark)';
const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];

const tokensCss = read('tokens.css');
const accentsCss = read('accents.css');

const base = (mode: Mode) =>
  readCssVars(tokensCss, ':root', mode === 'dark' ? DARK : undefined);

const palette = (accent: string, mode: Mode) =>
  readCssVars(
    accentsCss,
    `:root[data-accent='${accent}']`,
    mode === 'dark' ? DARK : undefined
  );

const cases = ACCENTS.flatMap((accent) =>
  MODES.map((mode) => [accent, mode] as const)
);

const ACCENT_VARS = [
  '--accent',
  '--on-accent',
  '--accent-text',
  '--accent-subtle',
];

describe('base tokens', () => {
  it.each(MODES)('foreground on background is at least 7:1 (%s)', (mode) => {
    const b = base(mode);
    expect(
      contrastRatio(b['--foreground']!, b['--background']!)
    ).toBeGreaterThanOrEqual(7);
  });

  it.each(MODES)(
    'muted foreground on background is at least 4.5:1 (%s)',
    (mode) => {
      const b = base(mode);
      expect(
        contrastRatio(b['--muted-foreground']!, b['--background']!)
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(MODES)(
    'border and focus ring are at least 3:1 on background (%s)',
    (mode) => {
      const b = base(mode);
      expect(
        contrastRatio(b['--border']!, b['--background']!)
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(b['--focus-ring']!, b['--background']!)
      ).toBeGreaterThanOrEqual(3);
    }
  );
});

describe('accent palettes', () => {
  it('defines every accent in light and dark with all four variables', () => {
    expect(ACCENTS).toHaveLength(8);
    for (const [accent, mode] of cases) {
      const p = palette(accent, mode);
      for (const name of ACCENT_VARS) {
        expect(p[name], `${accent}/${mode} ${name}`).toBeTruthy();
      }
    }
  });

  it.each(cases)('%s/%s: on-accent text on accent is at least 7:1', (a, m) => {
    const p = palette(a, m);
    expect(
      contrastRatio(p['--on-accent']!, p['--accent']!)
    ).toBeGreaterThanOrEqual(7);
  });

  it.each(cases)('%s/%s: accent text on background is at least 7:1', (a, m) => {
    const p = palette(a, m);
    expect(
      contrastRatio(p['--accent-text']!, base(m)['--background']!)
    ).toBeGreaterThanOrEqual(7);
  });

  it.each(cases)(
    '%s/%s: accent text on accent-subtle is at least 4.5:1',
    (a, m) => {
      const p = palette(a, m);
      expect(
        contrastRatio(p['--accent-text']!, p['--accent-subtle']!)
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(cases)(
    '%s/%s: accent is at least 3:1 on background (non-text)',
    (a, m) => {
      const p = palette(a, m);
      expect(
        contrastRatio(p['--accent']!, base(m)['--background']!)
      ).toBeGreaterThanOrEqual(3);
    }
  );
});

describe('applyAccent', () => {
  afterEach(() => {
    delete document.documentElement.dataset.accent;
  });

  it('defaults to violet', () => {
    expect(DEFAULT_ACCENT).toBe('violet');
  });

  it('sets the accent on the root element', () => {
    applyAccent('teal');
    expect(document.documentElement.dataset.accent).toBe('teal');
  });
});
