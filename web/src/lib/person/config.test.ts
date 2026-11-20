import { describe, expect, it } from 'vitest';

import { validateRecord } from '@/lib/lexicons/validate';

import {
  hideProblem,
  COUNTED_BLOCKS,
  itemLimit,
  mergeConfig,
  resolveConfig,
  serialiseConfig,
} from './config';

const ALL_TYPES = [
  'links',
  'talks',
  'openTo',
  'blogPosts',
  'bskyPosts',
  'publications',
  'skills',
  'education',
  'code',
  'collections',
  'media',
  'details',
];

describe('resolveConfig', () => {
  it('uses the smart defaults when there is no config record', () => {
    expect(resolveConfig(null)).toEqual({
      accent: 'blue',
      cover: null,
      showRole: true,
      showLocation: true,
      showOpenTo: true,
      blocks: ALL_TYPES.map((type) => ({
        type,
        visible: type === 'links' || type === 'talks',
      })),
      hidden: [],
    });
  });

  it('keeps the owner’s order, visibility and limits, appending blocks they never saw', () => {
    const config = resolveConfig({
      $type: 'app.lanyards.actor.lanyard',
      accent: 'mint',
      showJob: false,
      blocks: [
        { type: 'publications', visible: true, limit: 5 },
        { type: 'links', visible: false },
        { type: 'events', visible: true },
        { type: 'mystery', visible: true },
        { type: 'publications', visible: false },
      ],
      hidden: ['https://ada.example/'],
      createdAt: '2026-11-01T09:00:00.000Z',
    });
    expect(config.accent).toBe('mint');
    // The legacy showJob reads as the badge's showRole (#129).
    expect(config.showRole).toBe(false);
    expect(config.hidden).toEqual(['https://ada.example/']);
    expect(config.blocks.slice(0, 3)).toEqual([
      { type: 'publications', visible: true, limit: 5 },
      { type: 'links', visible: false },
      { type: 'talks', visible: true },
    ]);
    expect(config.blocks.map((block) => block.type)).toEqual([
      'publications',
      'links',
      ...ALL_TYPES.filter(
        (type) => type !== 'publications' && type !== 'links'
      ),
    ]);
  });

  it('falls back to blue for an accent it does not know', () => {
    expect(
      resolveConfig({ accent: 'chartreuse', createdAt: '2026-11-01T09:00:00Z' })
        .accent
    ).toBe('blue');
  });

  it('maps a legacy accent and writes the new value on save (#128)', () => {
    const record = {
      $type: 'app.lanyards.actor.lanyard',
      accent: 'pink',
      createdAt: '2026-11-01T09:00:00Z',
    };
    const config = resolveConfig(record);
    expect(config.accent).toBe('pink');
    expect(
      serialiseConfig(config, record, '2026-11-20T09:00:00Z')
    ).toMatchObject({ accent: 'pink' });
  });

  it('uses the defaults when the record is malformed', () => {
    expect(resolveConfig({ blocks: 'nope' })).toEqual(resolveConfig(null));
  });
});

describe('the badge settings (#129)', () => {
  const record = (fields: Record<string, unknown>) => ({
    $type: 'app.lanyards.actor.lanyard',
    createdAt: '2026-11-01T09:00:00Z',
    ...fields,
  });

  it('has no cover until one is picked, and shows everything by default', () => {
    const config = resolveConfig(record({}));
    expect(config.cover).toBeNull();
    expect(config.showRole).toBe(true);
    expect(config.showLocation).toBe(true);
    expect(config.showOpenTo).toBe(true);
  });

  it('reads the badge object, and an unknown cover as none', () => {
    expect(
      resolveConfig(
        record({
          badge: {
            cover: 'orb',
            showRole: false,
            showLocation: false,
            showOpenTo: false,
          },
        })
      )
    ).toMatchObject({
      cover: 'orb',
      showRole: false,
      showLocation: false,
      showOpenTo: false,
    });
    expect(resolveConfig(record({ badge: { cover: 'plaid' } })).cover).toBe(
      null
    );
  });

  it('reads the legacy showJob as showRole, and writes badge instead', () => {
    const stored = record({ showJob: false });
    const config = resolveConfig(stored);
    expect(config.showRole).toBe(false);
    const written = serialiseConfig(config, stored, '2026-11-20T09:00:00Z');
    expect(written).not.toHaveProperty('showJob');
    expect(written.badge).toEqual({
      showRole: false,
      showLocation: true,
      showOpenTo: true,
    });
  });

  it('writes a picked cover, round trip', () => {
    const config = { ...resolveConfig(null), cover: 'orb' as const };
    const written = serialiseConfig(config, null, '2026-11-20T09:00:00Z');
    expect(written.badge).toMatchObject({ cover: 'orb' });
    expect(
      resolveConfig({ ...written, $type: 'app.lanyards.actor.lanyard' }).cover
    ).toBe('orb');
  });

  it('keeps our cover in a merge when only we changed it', () => {
    const base = resolveConfig(null);
    const ours = { ...base, cover: 'pixels' as const };
    const theirs = { ...base, accent: 'pink' as const };
    expect(mergeConfig(base, ours, theirs)).toMatchObject({
      cover: 'pixels',
      accent: 'pink',
    });
  });
});

describe('itemLimit', () => {
  it.each([
    [{ type: 'bskyPosts' as const, visible: true }, 3],
    [{ type: 'blogPosts' as const, visible: true, limit: 7 }, 7],
    [{ type: 'publications' as const, visible: true, limit: 1 }, 1],
    [{ type: 'code' as const, visible: true }, 3],
    [{ type: 'collections' as const, visible: true, limit: 5 }, 5],
  ])('gives the counted block %o a limit of %i', (block, expected) => {
    expect(itemLimit(block)).toBe(expected);
  });

  it.each([
    { type: 'links' as const, visible: true },
    { type: 'links' as const, visible: true, limit: 4 },
    { type: 'talks' as const, visible: true, limit: 1 },
    { type: 'media' as const, visible: true, limit: 2 },
    { type: 'skills' as const, visible: true },
  ])('shows everything in the uncounted block %o', (block) => {
    expect(itemLimit(block)).toBe(Infinity);
  });

  it('counts exactly the feeds and Publications', () => {
    expect([...COUNTED_BLOCKS].sort()).toEqual([
      'blogPosts',
      'bskyPosts',
      'code',
      'collections',
      'publications',
    ]);
  });
});

describe('serialiseConfig', () => {
  const NOW = '2026-11-10T12:00:00.000Z';
  const EVENT =
    'at://did:plc:fixtureeventaaaaaaaaaaaaa/community.lexicon.calendar.event/3mevent';
  const previous = {
    $type: 'app.lanyards.actor.lanyard',
    accent: 'blue',
    blocks: [
      { type: 'links', visible: true },
      { type: 'events', visible: true },
      { type: 'talks', visible: false },
    ],
    connect: { follow: true, vouch: false, metPack: true },
    events: [{ event: EVENT, headline: 'Speaking on Thursday' }],
    createdAt: '2026-11-01T09:00:00.000Z',
  };

  it('keeps what this slice does not edit, in place, and stamps updatedAt', () => {
    const config = {
      ...resolveConfig(previous),
      accent: 'mint' as const,
      showRole: false,
    };
    const fields = serialiseConfig(config, previous, NOW);
    expect(fields).toMatchObject({
      accent: 'mint',
      badge: { showRole: false },
      connect: previous.connect,
      events: previous.events,
      createdAt: previous.createdAt,
      updatedAt: NOW,
    });
    expect(
      (fields.blocks as { type: string }[]).slice(0, 3).map((b) => b.type)
    ).toEqual(['links', 'events', 'talks']);
  });

  it('keeps an unrendered block at its position when blocks move', () => {
    const config = resolveConfig(previous);
    const [links, talks, ...rest] = config.blocks;
    const reordered = { ...config, blocks: [talks!, links!, ...rest] };
    const fields = serialiseConfig(reordered, previous, NOW);
    expect(
      (fields.blocks as { type: string }[]).slice(0, 3).map((b) => b.type)
    ).toEqual(['talks', 'events', 'links']);
  });

  it('creates the record on the first customisation', () => {
    const fields = serialiseConfig(resolveConfig(null), null, NOW);
    expect(fields).toMatchObject({ createdAt: NOW, updatedAt: NOW });
    expect(fields).not.toHaveProperty('$type');
  });

  it('validates as app.lanyards.actor.lanyard', () => {
    const fields = serialiseConfig(resolveConfig(previous), previous, NOW);
    expect(
      validateRecord('app.lanyards.actor.lanyard', {
        $type: 'app.lanyards.actor.lanyard',
        ...fields,
      }).ok
    ).toBe(true);
  });
});

describe('hideProblem', () => {
  const config = (hidden: string[]) => ({ ...resolveConfig(null), hidden });

  it('allows hiding an ordinary item, or one already hidden', () => {
    expect(hideProblem(config([]), 'at://did:plc:a/x.y/1')).toBeNull();
    expect(
      hideProblem(config(['at://did:plc:a/x.y/1']), 'at://did:plc:a/x.y/1')
    ).toBeNull();
  });

  it('refuses a 501st hidden item, as the lexicon allows 500', () => {
    const full = Array.from({ length: 500 }, (_, index) => `k${index}`);
    expect(hideProblem(config(full), 'k500')).toBe('tooMany');
    expect(hideProblem(config(full.slice(1)), 'k500')).toBeNull();
  });

  it('refuses a key over the lexicon’s 2,048 bytes, counting UTF-8', () => {
    expect(hideProblem(config([]), 'é'.repeat(1025))).toBe('tooLong');
    expect(hideProblem(config([]), 'e'.repeat(2048))).toBeNull();
  });
});

describe('mergeConfig', () => {
  const base = resolveConfig(null);

  it('keeps the other side’s change to a field this side left alone', () => {
    const ours = { ...base, hidden: ['k1'] };
    const theirs = { ...base, accent: 'mint' as const };
    expect(mergeConfig(base, ours, theirs)).toEqual({
      ...base,
      accent: 'mint',
      hidden: ['k1'],
    });
  });

  it('takes this side’s value for a field both changed', () => {
    const ours = { ...base, accent: 'pink' as const };
    const theirs = { ...base, accent: 'mint' as const };
    expect(mergeConfig(base, ours, theirs).accent).toBe('pink');
  });
});
