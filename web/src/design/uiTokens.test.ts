import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readCssVars } from '@/test/cssVars';

import { contrastRatio } from './contrast';

// Vitest runs from web/; import.meta.url is not a file URL under jsdom.
const tokensCss = readFileSync(
  resolve(process.cwd(), 'src/styles/tokens.css'),
  'utf8'
);

const DARK = '(prefers-color-scheme: dark)';
const MODES = ['light', 'dark'] as const;

const ui = (mode: (typeof MODES)[number]) =>
  readCssVars(tokensCss, ':root', mode === 'dark' ? DARK : undefined);

const ratio = (
  mode: (typeof MODES)[number],
  foreground: string,
  background: string
) => {
  const vars = ui(mode);
  return contrastRatio(vars[foreground]!, vars[background]!);
};

/** The app chrome's own palette, apart from the lanyard's (spec, #118). */
describe('UI tokens', () => {
  it.each(MODES)('defines every UI colour (%s)', (mode) => {
    const vars = ui(mode);
    for (const name of [
      '--ui-canvas',
      '--ui-surface',
      '--ui-surface-muted',
      '--ui-border',
      '--ui-border-strong',
      '--ui-text',
      '--ui-text-muted',
      '--ui-primary',
      '--ui-on-primary',
      '--ui-primary-subtle',
      '--ui-warning',
      '--ui-danger',
    ]) {
      expect(vars[name], name).toBeTruthy();
    }
  });

  it.each(MODES)('text on surfaces is at least 7:1 (%s)', (mode) => {
    expect(ratio(mode, '--ui-text', '--ui-surface')).toBeGreaterThanOrEqual(7);
  });

  it.each(MODES)(
    'muted text is at least 4.5:1 on surface and canvas (%s)',
    (mode) => {
      expect(
        ratio(mode, '--ui-text-muted', '--ui-surface')
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio(mode, '--ui-text-muted', '--ui-canvas')
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(MODES)('primary works as a button and as link text (%s)', (mode) => {
    expect(
      ratio(mode, '--ui-on-primary', '--ui-primary')
    ).toBeGreaterThanOrEqual(4.5);
    expect(ratio(mode, '--ui-primary', '--ui-surface')).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it.each(MODES)(
    'the error red works as text and as a field ring (%s)',
    (mode) => {
      expect(ratio(mode, '--ui-danger', '--ui-surface')).toBeGreaterThanOrEqual(
        4.5
      );
      expect(ratio(mode, '--ui-danger', '--ui-canvas')).toBeGreaterThanOrEqual(
        4.5
      );
    }
  );

  it.each(MODES)(
    'control boundaries and the unsaved dot are at least 3:1 (%s)',
    (mode) => {
      expect(
        ratio(mode, '--ui-border-strong', '--ui-surface')
      ).toBeGreaterThanOrEqual(3);
      expect(
        ratio(mode, '--ui-warning', '--ui-surface')
      ).toBeGreaterThanOrEqual(3);
    }
  );
});
