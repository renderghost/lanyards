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
  '(?:background|foreground|muted-foreground|surface|border|accent|on-accent|accent-text|accent-subtle|board-label|badge-button|on-badge-button|badge-ink|on-badge-ink|badge-line|qr-ground|qr-strap|qr-close)';
const throughVar = (name: string) =>
  `(?:\\((?:color:)?--(?:color-)?${name}\\)|\\[(?:color:)?var\\(--(?:color-)?${name}\\)\\])`;
const LANYARD_COLOUR = new RegExp(
  `^${COLOUR}-(?:${LANYARD_TOKEN}|${throughVar(LANYARD_TOKEN)})(?:/\\d+)?$`
);
const UI_COLOUR = new RegExp(`^${COLOUR}-(?:ui-|${throughVar('ui-[a-z-]+')})`);

// Spec #128: corners are 1 px (rounded-xs) or 3 px (rounded-sm), on any
// side; fully round only for round things.
const RADIUS = /^rounded(?:-[trblse]{1,2})?(?:-([a-z0-9]+|\[[^\]]+\]))?$/;
const ON_SCALE = new Set(['xs', 'sm', 'none', 'full']);

/** Round things: avatars, dots, spinners and colour swatches. */
const isRound = ({ file, path = '' }: ClassString) =>
  /(?:^|\.)(?:avatar|dot|spinner|swatch)$/.test(path) ||
  // The account link is a round focus target around its avatar.
  (file === 'src/components/AccountLink/AccountLink.styles.ts' &&
    path === 'link');

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

/**
 * Shared components that render only inside the lanyard, and the Show QR
 * badge, which wears the owner's accent wherever it opens (#129).
 */
const LANYARD_ONLY = [
  'src/components/RichText/',
  'src/features/qr/components/QrSheet/',
  'src/features/qr/components/LanyardStraps/',
];

/**
 * Chrome class strings that deliberately show the lanyard's palette, known by
 * where they live rather than what they say: each shared control's `accent`
 * tone, for use on the lanyard, and each accent's swatch, scoped with
 * data-accent to its own palette.
 */
const isLanyardInChrome = ({ file, path = '' }: ClassString) =>
  /^tones\.(?:accent|badge)(?:\.|$)/.test(path) ||
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

  // Tailwind generates only the classes it finds written out in the source:
  // one put together in a template literal (`${WIDE}:h-60`) never applies.
  it('writes every class out in full, so Tailwind generates it', () => {
    const source = globSync('src/**/*.{ts,tsx}')
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const missing = classStrings().flatMap(({ file, classes }) =>
      classes
        .split(/\s+/)
        .filter((token) => token && !source.includes(token))
        .map((token) => `${file}: ${token}`)
    );
    expect(missing).toEqual([]);
  });

  // CLAUDE.md: gap between siblings, padding inside; never margins.
  it('uses no margin utilities', () => {
    expect(
      offending((_variants, utility) => /^-?m[trblxyse]?-/.test(utility))
    ).toEqual([]);
  });

  // The accent fill is pale on mint, lime and pink, and dark blue on the
  // dark ground: as a focus ring or an edge it can fall below 3:1 (#128).
  it('never marks focus or edges with the accent fill', () => {
    expect(
      offending((_variants, utility) =>
        /^(?:outline|ring|border(?:-[trblxyse])?|decoration)-accent(?:\/\d+)?$/.test(
          utility
        )
      )
    ).toEqual([]);
  });

  it('uses no serif font: Rethink Sans throughout (#128)', () => {
    expect(offending((_variants, utility) => utility === 'font-serif')).toEqual(
      []
    );
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

  it('corners are 1px, 3px or full, everywhere (#128)', () => {
    expect(
      offending((_variants, utility) => {
        const size = RADIUS.exec(utility);
        return size !== null && !ON_SCALE.has(size[1] ?? '');
      })
    ).toEqual([]);
  });

  it('only round things are fully round (#128)', () => {
    expect(
      offending(
        (_variants, utility) =>
          /^rounded(?:-[trblse]{1,2})?-full$/.test(utility),
        (entry) => !isRound(entry)
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
        .filter(
          (match) =>
            !/\btone(?:="(?:accent|badge)"|=\{tone\})/.test(match[2] ?? '')
        )
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
