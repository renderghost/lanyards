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
  'media/item.json',
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
    ['link/media/audio.json', 'link/media/audio.json'],
    ['link/media/video.json', 'link/media/video.json'],
  ])('kept lexicon %s is unchanged from the legacy app', (path, legacyPath) => {
    expect(ours(path)).toEqual(legacy(legacyPath));
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

  it('lists every block type the app knows, once, plus roles', () => {
    const doc = ours('actor/lanyard.json') as {
      defs: {
        blockType: { knownValues: string[] };
        block: { properties: { type: { ref: string } } };
        eventOverride: {
          properties: { emphasise: { items: { ref: string } } };
        };
      };
    };
    // Roles is in the lexicon from #132; the app learns it in #130.
    expect(doc.defs.blockType.knownValues).toEqual([...BLOCK_TYPES, 'roles']);
    expect(doc.defs.block.properties.type.ref).toBe('#blockType');
    expect(doc.defs.eventOverride.properties.emphasise.items.ref).toBe(
      '#blockType'
    );
  });

  it('retires the lexicons that duplicate Sifa and Bluesky', () => {
    expect(() => ours('actor/biography/honorific.json')).toThrow();
    expect(() => ours('link/web.json')).toThrow();
  });
});
