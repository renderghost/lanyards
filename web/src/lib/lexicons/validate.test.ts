import { describe, expect, it } from 'vitest';

import { BLOCK_TYPES } from './nsids';
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

  it('accepts the badge settings and the roles block', () => {
    const result = validateRecord('app.lanyards.actor.lanyard', {
      ...fullLanyard,
      blocks: [{ type: 'roles', visible: true }],
      badge: {
        cover: 'orb',
        showRole: false,
        showLocation: true,
        showOpenTo: false,
      },
    });
    expect(result.ok).toBe(true);
  });

  it('lets an event override emphasise every block type, roles included', () => {
    const result = validateRecord('app.lanyards.actor.lanyard', {
      ...fullLanyard,
      events: [
        {
          event: EVENT,
          emphasise: [...BLOCK_TYPES],
        },
      ],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a badge setting of the wrong type', () => {
    const result = validateRecord('app.lanyards.actor.lanyard', {
      ...fullLanyard,
      badge: { showRole: 'no' },
    });
    expect(result.ok).toBe(false);
  });

  it('accepts a podcast or video as one media item', () => {
    const result = validateRecord('app.lanyards.media.item', {
      $type: 'app.lanyards.media.item',
      url: 'https://example.com/episode-1',
      kind: 'video',
      platform: 'youtube',
      type: 'interview',
      title: 'An interview',
      duration: 1800,
      publishedAt: NOW,
      createdAt: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('leaves the media kind and platform open', () => {
    const result = validateRecord('app.lanyards.media.item', {
      $type: 'app.lanyards.media.item',
      url: 'https://example.com/hologram',
      kind: 'hologram',
      platform: 'newtube',
      createdAt: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a media item whose url is not a URI', () => {
    const result = validateRecord('app.lanyards.media.item', {
      $type: 'app.lanyards.media.item',
      url: 'not a url',
      kind: 'audio',
      createdAt: NOW,
    });
    expect(result.ok).toBe(false);
  });

  // Feedback to our UserInput board (#134).
  const discussion = {
    $type: 'app.userinput.discussion',
    space: {
      uri: 'at://did:plc:ua3d6biqepazbq6mw4ysotfo/app.userinput.space/3mboard',
      cid: `bafyrei${'c'.repeat(52)}`,
    },
    title: 'The badge overlaps on my phone',
    body: 'Steps to reproduce…',
    tags: ['bug'],
    createdAt: NOW,
  };
  const screenshot = {
    alt: 'The badge on a 320 px phone',
    image: {
      $type: 'blob',
      ref: { $link: `bafkrei${'d'.repeat(52)}` },
      mimeType: 'image/webp',
      size: 48_000,
    },
  };

  it('accepts a UserInput discussion with a screenshot', () => {
    expect(
      validateRecord('app.userinput.discussion', {
        ...discussion,
        images: [screenshot],
      }).ok
    ).toBe(true);
  });

  it('rejects a UserInput discussion with five screenshots', () => {
    expect(
      validateRecord('app.userinput.discussion', {
        ...discussion,
        images: Array.from({ length: 5 }, () => screenshot),
      }).ok
    ).toBe(false);
  });

  it('reads a UserInput board with its tags', () => {
    expect(
      validateRecord('app.userinput.space', {
        $type: 'app.userinput.space',
        name: 'Lanyards feedback',
        tags: [{ value: 'bug', label: 'Bug' }],
        createdAt: NOW,
      }).ok
    ).toBe(true);
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
