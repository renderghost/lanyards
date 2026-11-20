import { describe, expect, it } from 'vitest';

import item from '../../../../lexicons/lanyards/app/lanyards/media/item.json';
import {
  collectionOf,
  itemFromLegacy,
  MEDIA_PLATFORMS,
  MEDIA_TYPES,
} from './media';

const known = item.defs.main.record.properties;

describe('itemFromLegacy', () => {
  it('turns a legacy record into a media item, keeping every field', () => {
    expect(
      itemFromLegacy('audio', {
        $type: 'app.lanyards.link.media.audio',
        url: 'https://pod.example/1',
        platform: 'spotify',
        title: 'Episode one',
        description: 'Notes',
        type: 'podcast-episode',
        seriesName: 'The series',
        duration: 1800,
        publishedDate: '2025-06-01T09:00:00.000Z',
        relatedWork: 'at://did:plc:a/app.lanyards.link.work.publication/1',
        createdAt: '2025-01-01T09:00:00.000Z',
      })
    ).toEqual({
      url: 'https://pod.example/1',
      kind: 'audio',
      platform: 'spotify',
      title: 'Episode one',
      description: 'Notes',
      type: 'podcast-episode',
      seriesName: 'The series',
      duration: 1800,
      publishedAt: '2025-06-01T09:00:00.000Z',
      related: 'at://did:plc:a/app.lanyards.link.work.publication/1',
      createdAt: '2025-01-01T09:00:00.000Z',
    });
  });

  it.each(['lecture', 'presentation', 'conference-talk'])(
    'reads the talk type %s as other: talk recordings belong on Sifa',
    (type) => {
      expect(
        itemFromLegacy('video', {
          url: 'https://video.example/1',
          platform: 'youtube',
          type,
          createdAt: '2025-01-01T09:00:00.000Z',
        })
      ).toMatchObject({ kind: 'video', type: 'other' });
    }
  );
});

describe('collectionOf', () => {
  it('reads the collection from an AT-URI', () => {
    expect(collectionOf('at://did:plc:a/app.lanyards.media.item/3m')).toBe(
      'app.lanyards.media.item'
    );
  });
});

describe('the form’s choices', () => {
  it('offer only platforms and types the lexicon knows, and no talk types', () => {
    for (const kind of ['audio', 'video'] as const) {
      for (const platform of MEDIA_PLATFORMS[kind]) {
        expect(known.platform.knownValues).toContain(platform);
      }
      for (const type of MEDIA_TYPES[kind]) {
        expect(known.type.knownValues).toContain(type);
      }
      expect(MEDIA_TYPES[kind]).not.toContain('conference-talk');
      expect(MEDIA_TYPES[kind]).not.toContain('lecture');
    }
  });
});
