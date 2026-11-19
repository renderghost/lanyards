import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** A class string, its file, and (in a style module) its export path. */
type ClassString = { file: string; classes: string; path?: string };

// Style modules are evaluated, not read as text, so template literals and
// nested records (such as each component's tones) are checked as the app
// sees them.
const styleModules = import.meta.glob<Record<string, unknown>>(
  '../src/**/*.styles.ts',
  { eager: true }
);

/** Every string in a module's exports, however nested, with its path. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) =>
      strings(inner, path ? `${path}.${key}` : key)
    );
  }
  return [];
}

/** Every Tailwind class string in the app, with the file it's in. */
function classStrings(): ClassString[] {
  const found: ClassString[] = [];
  for (const [key, exports] of Object.entries(styleModules)) {
    const file = key.replace(/^\.\.\//, '');
    for (const [path, classes] of strings(exports)) {
      found.push({ file, classes, path });
    }
  }
  const files = globSync('src/**/*.{ts,tsx}').filter(
    (file) => !/\.test\.tsx?$/.test(file) && !file.endsWith('.styles.ts')
  );
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/className="([^"]*)"/g)) {
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
  // `!` (important) may lead or trail the utility; it changes nothing here.
  return [token.slice(0, cut), token.slice(cut).replace(/^!|!$/g, '')];
}

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

// Colour utilities, by which palette they draw from (#118), whether named
// (bg-surface) or through a CSS variable (bg-(--surface), bg-[var(--surface)]).
const COLOUR =
  '(?:bg|text|border(?:-[trblxyse])?|ring|outline|fill|stroke|divide|placeholder|decoration|caret|accent|from|via|to|shadow)';
const LANYARD_TOKEN =
  '(?:background|foreground|muted-foreground|surface|border|accent|on-accent|accent-text|accent-subtle)';
const throughVar = (name: string) =>
  `(?:\\((?:color:)?--(?:color-)?${name}\\)|\\[(?:color:)?var\\(--(?:color-)?${name}\\)\\])`;
const LANYARD_COLOUR = new RegExp(
  `^${COLOUR}-(?:${LANYARD_TOKEN}|${throughVar(LANYARD_TOKEN)})(?:/\\d+)?$`
);
const UI_COLOUR = new RegExp(`^${COLOUR}-(?:ui-|${throughVar('ui-[a-z-]+')})`);

// Spec #118: the product UI's corners are 8–14px (rounded-lg, rounded-xl).
const OFF_SCALE_RADIUS =
  /^rounded(?:-[trblse]{1,2})?(?:-(?:xs|sm|md|2xl|3xl|4xl))?$/;

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

/**
 * Chrome class strings that deliberately show the lanyard's palette, known by
 * where they live rather than what they say: each shared control's `accent`
 * tone, for use on the lanyard, and each accent's swatch, scoped with
 * data-accent to its own palette.
 */
const isLanyardInChrome = ({ file, path = '' }: ClassString) =>
  /^tones\.accent(?:\.|$)/.test(path) ||
  (file ===
    'src/features/lanyard/customise/AccentPicker/AccentPicker.styles.ts' &&
    path === 'swatch');

const startsWithAny = (file: string, prefixes: string[]) =>
  prefixes.some((prefix) => file.startsWith(prefix));

const inChrome = ({ file }: ClassString) =>
  startsWithAny(file, CHROME) && !startsWithAny(file, LANYARD_ONLY);

const inLanyard = ({ file }: ClassString) =>
  file.startsWith('src/features/lanyard/components/') ||
  startsWithAny(file, LANYARD_ONLY);

describe('style rules', () => {
  it('finds the class strings it checks, in every scope', () => {
    const all = classStrings();
    expect(all.length).toBeGreaterThan(250);
    expect(all.filter(inChrome).length).toBeGreaterThan(150);
    expect(all.filter(inLanyard).length).toBeGreaterThan(75);
    // Button, ExternalLink and HandleCombobox accent tones, and the swatch.
    expect(all.filter(isLanyardInChrome).length).toBeGreaterThan(10);
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
        (entry) => inChrome(entry) && !isLanyardInChrome(entry)
      )
    ).toEqual([]);
  });

  it('chrome corners are 8–14px', () => {
    expect(
      offending(
        (_variants, utility) => OFF_SCALE_RADIUS.test(utility),
        (entry) => inChrome(entry) && !isLanyardInChrome(entry)
      )
    ).toEqual([]);
  });

  // Button, ExternalLink and HandleCombobox default to the UI tone; on the
  // lanyard they must take its accent instead.
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
          /<(Button|ExternalLink|HandleCombobox)\b((?:=>|[^>])*)>/g
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
      offending((_variants, utility) => UI_COLOUR.test(utility), inLanyard)
    ).toEqual([]);
  });
});
