import { describe, expect, it } from 'vitest';

import { validateRecord } from '@/lib/lexicons/validate';

import {
  hideProblem,
  itemLimit,
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
      accent: 'violet',
      showJob: true,
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
      accent: 'teal',
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
    expect(config.accent).toBe('teal');
    expect(config.showJob).toBe(false);
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

  it('falls back to violet for an accent it does not know', () => {
    expect(
      resolveConfig({ accent: 'chartreuse', createdAt: '2026-11-01T09:00:00Z' })
        .accent
    ).toBe('violet');
  });

  it('uses the defaults when the record is malformed', () => {
    expect(resolveConfig({ blocks: 'nope' })).toEqual(resolveConfig(null));
  });
});

describe('itemLimit', () => {
  it.each([
    [{ type: 'links' as const, visible: true }, 20],
    [{ type: 'talks' as const, visible: true }, 3],
    [{ type: 'talks' as const, visible: true, limit: 7 }, 7],
    [{ type: 'links' as const, visible: true, limit: 25 }, 20],
    [{ type: 'links' as const, visible: true, limit: 4 }, 4],
  ])('gives %o a limit of %i', (block, expected) => {
    expect(itemLimit(block)).toBe(expected);
  });
});

describe('serialiseConfig', () => {
  const NOW = '2026-11-10T12:00:00.000Z';
  const EVENT =
    'at://did:plc:fixtureeventaaaaaaaaaaaaa/community.lexicon.calendar.event/3mevent';
  const previous = {
    $type: 'app.lanyards.actor.lanyard',
    accent: 'violet',
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
      accent: 'teal' as const,
      showJob: false,
    };
    const fields = serialiseConfig(config, previous, NOW);
    expect(fields).toMatchObject({
      accent: 'teal',
      showJob: false,
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
