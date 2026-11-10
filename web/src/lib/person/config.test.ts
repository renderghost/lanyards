import { describe, expect, it } from 'vitest';

import { itemLimit, resolveConfig } from './config';

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
