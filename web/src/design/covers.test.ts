import { describe, expect, it } from 'vitest';

import { COVERS, coverFor, initialsOf, isCover } from './covers';

describe('covers', () => {
  it('has the eight patterns', () => {
    expect(COVERS).toEqual([
      'dots',
      'stripes',
      'pixels',
      'orb',
      'symbols',
      'hazard',
      'arrows',
      'monogram',
    ]);
    expect(isCover('orb')).toBe(true);
    expect(isCover('plaid')).toBe(false);
    expect(isCover(undefined)).toBe(false);
  });

  it('derives the same cover from the same DID, every time', () => {
    const did = 'did:plc:fixturealiceaaaaaaaaaaaa';
    expect(coverFor(did)).toBe(coverFor(did));
    expect(COVERS).toContain(coverFor(did));
  });

  it('spreads people across the patterns', () => {
    const covers = new Set(
      Array.from({ length: 50 }, (_, index) =>
        coverFor(`did:plc:sample${index.toString().padStart(20, 'a')}`)
      )
    );
    expect(covers.size).toBeGreaterThanOrEqual(6);
  });
});

describe('initialsOf', () => {
  it.each([
    ['B. Prendergast', 'BP'],
    ['Ada', 'A'],
    ['Ada Lovelace King', 'AK'],
    ['ada lovelace', 'AL'],
    ['  Ada   Example  ', 'AE'],
    ['Émile Zola', 'ÉZ'],
    ['', ''],
  ])('%s gives %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});
