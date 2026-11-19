import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { tones as buttonTones } from '../src/components/Button/Button.styles';
import { tones as linkTones } from '../src/components/ExternalLink/ExternalLink.styles';
import { swatch } from '../src/features/lanyard/customise/AccentPicker/AccentPicker.styles';

/** Every Tailwind class string in the app, with the file it's in. */
function classStrings(): { file: string; classes: string }[] {
  const found: { file: string; classes: string }[] = [];
  const files = globSync('src/**/*.{ts,tsx}').filter(
    (file) => !/\.test\.tsx?$/.test(file)
  );
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    // Style modules hold nothing but class strings (CLAUDE.md).
    const pattern = file.endsWith('.styles.ts')
      ? /'([^'\n]*)'/g
      : /className="([^"]*)"/g;
    for (const match of source.matchAll(pattern)) {
      found.push({ file, classes: match[1] ?? '' });
    }
  }
  return found;
}

/** A class without its variants: `lg:hover:mx-4` → ['lg:hover:', 'mx-4']. */
function split(token: string): [string, string] {
  let depth = 0;
  let cut = 0;
  for (let index = 0; index < token.length; index += 1) {
    const char = token[index];
    if (char === '[') depth += 1;
    else if (char === ']') depth -= 1;
    else if (char === ':' && depth === 0) cut = index + 1;
  }
  return [token.slice(0, cut), token.slice(cut)];
}

type ClassString = { file: string; classes: string };

function offending(
  test: (variants: string, utility: string) => boolean,
  within: (entry: ClassString) => boolean = () => true
) {
  return classStrings()
    .filter(within)
    .flatMap(({ file, classes }) =>
      classes
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => test(...split(token)))
        .map((token) => `${file}: ${token}`)
    );
}

// Colour utilities, by which palette they draw from (#118).
const COLOUR =
  '(bg|text|border(?:-[trblxyse])?|ring|outline|fill|stroke|divide|placeholder|decoration|caret|accent|from|via|to)';
const LANYARD_COLOUR = new RegExp(
  `^${COLOUR}-(background|foreground|muted-foreground|surface|border|accent|on-accent|accent-text|accent-subtle)(/\\d+)?$`
);
const UI_COLOUR = new RegExp(`^${COLOUR}-ui-`);

/** The product UI: everything but the lanyard itself. */
const CHROME = [
  'src/app/',
  'src/components/',
  'src/features/account/',
  'src/features/auth/',
  'src/features/lanyard/customise/',
  'src/features/qr/',
  'src/routes/',
];

/** Shared components that render only inside the lanyard. */
const LANYARD_ONLY = ['src/components/RichText/'];

/** Chrome class strings that deliberately show the lanyard's palette. */
const LANYARD_IN_CHROME = new Set<string>([
  // Buttons and links placed on the lanyard.
  ...Object.values(buttonTones.accent),
  linkTones.accent,
  // Each accent's swatch, scoped with data-accent to its own palette.
  swatch,
]);

const startsWithAny = (file: string, prefixes: string[]) =>
  prefixes.some((prefix) => file.startsWith(prefix));

describe('style rules', () => {
  it('finds the class strings it checks', () => {
    expect(classStrings().length).toBeGreaterThan(100);
  });

  // CLAUDE.md: gap between siblings, padding inside; never margins.
  it('uses no margin utilities', () => {
    expect(
      offending((_variants, utility) => /^-?m[trblxyse]?-/.test(utility))
    ).toEqual([]);
  });

  // The global :focus-visible ring is the keyboard focus indicator. An
  // unconditional outline-none removes it (WCAG 2.4.7).
  it('never removes the focus ring outright', () => {
    expect(
      offending(
        (variants, utility) => variants === '' && utility === 'outline-none'
      )
    ).toEqual([]);
  });
  // #118: the product UI has its own neutral palette, apart from the
  // lanyard's brand tokens and accents.
  it('chrome uses only UI tokens', () => {
    expect(
      offending(
        (_variants, utility) => LANYARD_COLOUR.test(utility),
        ({ file, classes }) =>
          startsWithAny(file, CHROME) &&
          !startsWithAny(file, LANYARD_ONLY) &&
          !LANYARD_IN_CHROME.has(classes)
      )
    ).toEqual([]);
  });

  // Button and ExternalLink default to the UI tone; on the lanyard they
  // must take its accent instead.
  it('the lanyard’s buttons and links use its accent', () => {
    const files = globSync('src/**/*.tsx').filter(
      (file) =>
        !/\.test\.tsx$/.test(file) &&
        (file.startsWith('src/features/lanyard/components/') ||
          startsWithAny(file, LANYARD_ONLY))
    );
    const untoned = files.flatMap((file) =>
      [
        ...readFileSync(file, 'utf8').matchAll(
          /<(Button|ExternalLink)\b((?:=>|[^>])*)>/g
        ),
      ]
        .filter((match) => !/\btone="accent"/.test(match[2] ?? ''))
        .map((match) => `${file}: <${match[1]}>`)
    );
    expect(files.length).toBeGreaterThan(10);
    expect(untoned).toEqual([]);
  });

  it('the lanyard uses only lanyard tokens', () => {
    expect(
      offending(
        (_variants, utility) => UI_COLOUR.test(utility),
        ({ file }) =>
          file.startsWith('src/features/lanyard/components/') ||
          startsWithAny(file, LANYARD_ONLY)
      )
    ).toEqual([]);
  });
});
