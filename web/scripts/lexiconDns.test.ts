import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd(), 'lexicons/lanyards');

function lexiconIds(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? lexiconIds(join(dir, entry.name))
      : entry.name.endsWith('.json')
        ? [
            (
              JSON.parse(readFileSync(join(dir, entry.name), 'utf8')) as {
                id: string;
              }
            ).id,
          ]
        : []
  );
}

/**
 * The TXT record an NSID resolves through: its authority (the NSID less
 * its name, reversed) under _lexicon. Resolvers never walk up the tree.
 */
const record = (nsid: string) =>
  `_lexicon.${nsid.split('.').slice(0, -1).reverse().join('.')}`;

// The README's publishing steps list the records to create in DNS (#165).
describe('the README’s lexicon DNS records', () => {
  it('are exactly the ones the lexicons we publish need', () => {
    const needed = [...new Set(lexiconIds(ROOT).map(record))].sort();
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8');
    const listed = [
      ...readme.matchAll(/^\s*\|\s*`(_lexicon\.[a-z.]+)`\s*\|/gm),
    ].map((match) => match[1]);
    expect(listed.sort()).toEqual(needed);
    expect(needed).toContain('_lexicon.media.lanyards.app');
  });
});
