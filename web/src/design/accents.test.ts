import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readCssVars } from '@/test/cssVars';

import { ACCENTS, applyAccent, DEFAULT_ACCENT, resolveAccent } from './accents';
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
  '--focus-ring-on-accent',
  '--cover-ground',
  '--cover-mark',
  '--cover-partner',
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
    'control borders and the focus ring are at least 3:1 (%s)',
    (mode) => {
      const b = base(mode);
      // --border is a hairline between blocks; controls use --border-strong.
      for (const ground of ['--background', '--surface']) {
        expect(
          contrastRatio(b['--border-strong']!, b[ground]!)
        ).toBeGreaterThanOrEqual(3);
      }
      expect(
        contrastRatio(b['--focus-ring']!, b['--background']!)
      ).toBeGreaterThanOrEqual(3);
    }
  );

  it.each(MODES)('muted text is at least 4.5:1 on surfaces (%s)', (mode) => {
    const b = base(mode);
    for (const ground of ['--surface', '--subtle']) {
      expect(
        contrastRatio(b['--muted-foreground']!, b[ground]!)
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each([
    ['light', '--background', '#faf9fd'],
    ['light', '--foreground', '#06011e'],
    ['light', '--muted-foreground', '#5c5873'],
    ['light', '--surface', '#ffffff'],
    ['light', '--subtle', '#f6f5ff'],
    ['light', '--border', 'rgb(6 1 30 / 0.09)'],
    ['dark', '--background', '#06011e'],
    ['dark', '--foreground', '#f6f5ff'],
    ['dark', '--muted-foreground', '#a9a6bd'],
    ['dark', '--surface', '#0e0a26'],
    ['dark', '--subtle', '#17122f'],
    ['dark', '--border', 'rgb(246 245 255 / 0.1)'],
  ] as const)(
    'the lanyard’s %s %s is the brand’s %s',
    (mode, name, expected) => {
      expect(base(mode)[name]?.trim().toLowerCase()).toBe(expected);
    }
  );
});

describe('accent palettes', () => {
  it('defines the four brand accents in light and dark, every variable', () => {
    expect(ACCENTS).toEqual(['blue', 'mint', 'lime', 'pink']);
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

  // Light fills (mint, lime, pink) carry ink, never meaning on their own:
  // what must be seen on them is the focus ring.
  it.each(cases)('%s/%s: the focus ring shows on the accent field', (a, m) => {
    const p = palette(a, m);
    expect(
      contrastRatio(p['--focus-ring-on-accent']!, p['--accent']!)
    ).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ['blue', '#4020df'],
    ['mint', '#8bf9be'],
    ['lime', '#eaff00'],
    ['pink', '#f7879a'],
  ] as const)('%s fills with the brand’s %s', (accent, fill) => {
    for (const mode of MODES) {
      expect(palette(accent, mode)['--accent']?.trim().toLowerCase()).toBe(
        fill
      );
    }
  });
});

describe('resolveAccent', () => {
  it.each([
    ['blue', 'blue'],
    ['lime', 'lime'],
    ['violet', 'blue'],
    ['indigo', 'blue'],
    ['ocean', 'blue'],
    ['moss', 'mint'],
    ['teal', 'mint'],
    ['rose', 'pink'],
    ['plum', 'pink'],
    ['ember', 'pink'],
    ['nonsense', 'blue'],
    [undefined, 'blue'],
  ] as const)('reads %s as %s', (stored, accent) => {
    expect(resolveAccent(stored)).toBe(accent);
  });
});

describe('applyAccent', () => {
  afterEach(() => {
    delete document.documentElement.dataset.accent;
  });

  it('defaults to blue', () => {
    expect(DEFAULT_ACCENT).toBe('blue');
  });

  it('sets the accent on the root element', () => {
    applyAccent('mint');
    expect(document.documentElement.dataset.accent).toBe('mint');
  });
});
