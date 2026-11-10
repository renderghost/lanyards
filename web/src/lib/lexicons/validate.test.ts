import { describe, expect, it } from 'vitest';

import { stripNulls, validateRecord } from './validate';

const NOW = '2026-11-10T09:00:00.000Z';
const EVENT =
  'at://did:plc:fixtureorganiser00000000/community.lexicon.calendar.event/3lfixture';

const fullLanyard = {
  $type: 'app.lanyards.actor.lanyard',
  accent: 'teal',
  showJob: false,
  blocks: Array.from({ length: 20 }, (_, index) => ({
    type: index % 2 ? 'links' : 'talks',
    visible: index % 3 === 0,
    limit: (index % 20) + 1,
  })),
  hidden: ['https://example.com/hidden', `${EVENT}x`],
  connect: { follow: true, vouch: false, metPack: true },
  events: [
    {
      event: EVENT,
      headline: 'Here for the keynotes',
      hereFor: 'Meeting people who build with ATProto',
      emphasise: ['talks', 'links'],
      metPacks: [
        'at://did:plc:fixturealice000000000000/app.bsky.graph.starterpack/3lmet',
      ],
    },
  ],
  createdAt: NOW,
  updatedAt: NOW,
};

describe('validateRecord', () => {
  it('accepts a minimal lanyard config', () => {
    const result = validateRecord('app.lanyards.actor.lanyard', {
      $type: 'app.lanyards.actor.lanyard',
      createdAt: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('accepts a full lanyard config with 20 blocks and event overrides', () => {
    expect(validateRecord('app.lanyards.actor.lanyard', fullLanyard).ok).toBe(
      true
    );
  });

  it('rejects a lanyard config with more than 20 blocks', () => {
    const blocks = [...fullLanyard.blocks, { type: 'links', visible: true }];
    const result = validateRecord('app.lanyards.actor.lanyard', {
      ...fullLanyard,
      blocks,
    });
    expect(result.ok).toBe(false);
  });

  it.each([0, 21])('rejects a block limit of %i', (limit) => {
    const result = validateRecord('app.lanyards.actor.lanyard', {
      ...fullLanyard,
      blocks: [{ type: 'links', visible: true, limit }],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects an honorific outside the closed enum', () => {
    const result = validateRecord('app.lanyards.actor.biography.honorific', {
      $type: 'app.lanyards.actor.biography.honorific',
      value: 'Mx',
      createdAt: NOW,
    });
    expect(result.ok).toBe(false);
  });

  it('accepts a kept honorific', () => {
    const result = validateRecord('app.lanyards.actor.biography.honorific', {
      $type: 'app.lanyards.actor.biography.honorific',
      value: 'Dr',
      createdAt: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a web link whose url is not a URI', () => {
    const result = validateRecord('app.lanyards.link.web', {
      $type: 'app.lanyards.link.web',
      url: 'not a url',
      createdAt: NOW,
    });
    expect(result.ok).toBe(false);
  });

  it('tolerates null optional fields in third-party records', () => {
    const result = validateRecord('id.sifa.profile.position', {
      $type: 'id.sifa.profile.position',
      title: 'Research Engineer',
      startedAt: '2024-03',
      onBehalfOf: null,
      createdAt: NOW,
    });
    expect(result.ok).toBe(true);
  });
});

describe('stripNulls', () => {
  it('removes null properties recursively and keeps array items', () => {
    expect(stripNulls({ a: null, b: { c: null, d: 1 }, e: [1, null] })).toEqual(
      { b: { d: 1 }, e: [1, null] }
    );
  });
});
