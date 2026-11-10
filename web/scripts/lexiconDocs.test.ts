import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { lexiconDoc, refineLexiconDoc } from '@atcute/lexicon-doc';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { AUTH_FULL_COLLECTIONS, BLOCK_TYPES } from '../src/lib/lexicons/nsids';

const ours = (path: string) =>
  JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'lexicons/lanyards/app/lanyards', path),
      'utf8'
    )
  ) as Record<string, unknown>;

const legacy = (path: string) =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), '../lexicons', path), 'utf8')
  ) as Record<string, unknown>;

const AUTHORED = [
  'authFull.json',
  'actor/lanyard.json',
  'actor/biography/honorific.json',
  'link/web.json',
  'link/media/audio.json',
  'link/media/video.json',
];

describe('authored lexicon documents', () => {
  it.each(AUTHORED)('%s is a valid lexicon document', (path) => {
    const parsed = v.safeParse(lexiconDoc, ours(path));
    expect(parsed.issues?.map((issue) => issue.message)).toBeUndefined();
    expect(refineLexiconDoc(parsed.output as never, true)).toEqual([]);
  });

  it.each([
    ['actor/biography/honorific.json', 'actor/biography/honorific.json'],
    ['link/web.json', 'link/web/web.json'],
    ['link/media/audio.json', 'link/media/audio.json'],
    ['link/media/video.json', 'link/media/video.json'],
  ])('kept lexicon %s is unchanged from the legacy app', (path, legacyPath) => {
    expect(ours(path)).toEqual(legacy(legacyPath));
  });

  it('keeps the web link NSID the legacy app writes', () => {
    expect(ours('link/web.json').id).toBe('app.lanyards.link.web');
  });

  it('grants repo access to exactly the Lanyards collections', () => {
    const doc = ours('authFull.json') as {
      defs: { main: { permissions: { collection: string[] }[] } };
    };
    expect(doc.defs.main.permissions).toHaveLength(1);
    expect([...doc.defs.main.permissions[0]!.collection].sort()).toEqual(
      [...AUTH_FULL_COLLECTIONS].sort()
    );
  });

  it('lists every block type the app knows', () => {
    const doc = ours('actor/lanyard.json') as {
      defs: { block: { properties: { type: { knownValues: string[] } } } };
    };
    expect(doc.defs.block.properties.type.knownValues).toEqual([
      ...BLOCK_TYPES,
    ]);
  });
});
