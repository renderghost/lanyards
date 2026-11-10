import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

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

function offending(test: (variants: string, utility: string) => boolean) {
  return classStrings().flatMap(({ file, classes }) =>
    classes
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => test(...split(token)))
      .map((token) => `${file}: ${token}`)
  );
}

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
});
