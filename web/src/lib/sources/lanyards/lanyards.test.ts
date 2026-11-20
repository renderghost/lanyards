import { beforeEach, describe, expect, it } from 'vitest';

import {
  mockDidDocument,
  mockGetRecord,
  mockListRecords,
} from '@/test/handlers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import records from './fixtures/records.json';
import { fetchLanyardConfig, fetchLanyardRecords } from './lanyards';

const LANYARD = 'app.lanyards.actor.lanyard';
const HONORIFIC = 'app.lanyards.actor.biography.honorific';

function serve(options: { config?: boolean } = {}) {
  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(
    ADA.pds,
    ADA.did,
    LANYARD,
    'self',
    options.config === false ? null : records.config
  );
  mockListRecords(ADA.pds, ADA.did, 'app.lanyards.media.item', records.items);
  mockListRecords(
    ADA.pds,
    ADA.did,
    'app.lanyards.link.media.audio',
    records.audio
  );
  mockListRecords(
    ADA.pds,
    ADA.did,
    'app.lanyards.link.media.video',
    records.video
  );
}

describe('fetchLanyardRecords', () => {
  beforeEach(() => {
    serve();
  });

  it('reads podcasts and videos, new and legacy', async () => {
    const asked: string[] = [];
    const listen = ({ request }: { request: Request }) => {
      const url = new URL(request.url);
      asked.push(url.searchParams.get('collection') ?? '');
    };
    server.events.on('request:start', listen);
    const result = await fetchLanyardRecords(ADA.did);
    server.events.removeListener('request:start', listen);
    expect(asked).toEqual(
      expect.arrayContaining([
        'app.lanyards.media.item',
        'app.lanyards.link.media.audio',
        'app.lanyards.link.media.video',
      ])
    );
    // Retired: Sifa and Bluesky hold these (#132).
    expect(asked).not.toContain('app.lanyards.link.web');
    expect(asked).not.toContain(HONORIFIC);
    expect(result).toEqual({
      ok: true,
      value: {
        media: [
          {
            key: `at://${ADA.did}/app.lanyards.media.item/3mitem`,
            kind: 'video',
            url: 'https://vimeo.com/fixture',
            platform: 'vimeo',
            title: 'Studio interview',
            type: 'interview',
            publishedAt: '2025-09-01T09:00:00.000Z',
          },
          {
            key: `at://${ADA.did}/app.lanyards.link.media.audio/3maudio`,
            kind: 'audio',
            url: 'https://podcasts.example/episode-12',
            platform: 'apple-podcasts',
            title: 'Talking protocols',
            type: 'interview',
            legacy: true,
          },
          {
            // A talk recording's type belongs on Sifa now: it reads as other.
            key: `at://${ADA.did}/app.lanyards.link.media.video/3mvideo`,
            kind: 'video',
            url: 'https://youtube.com/watch?v=fixture',
            platform: 'youtube',
            title: 'Keynote recording',
            type: 'other',
            publishedAt: '2025-06-12T09:00:00.000Z',
            legacy: true,
          },
        ],
      },
    });
  });

  it('reads the config on its own', async () => {
    await expect(fetchLanyardConfig(ADA.did)).resolves.toEqual({
      ok: true,
      value: {
        value: records.config.value,
        cid: records.config.cid,
        valid: true,
      },
    });
  });

  it('keeps a config that fails validation, marked invalid', async () => {
    const invalid = {
      ...records.config,
      value: {
        ...records.config.value,
        blocks: [{ type: 'links', visible: true, limit: 0 }],
      },
    };
    mockGetRecord(ADA.pds, ADA.did, LANYARD, 'self', invalid);
    await expect(fetchLanyardConfig(ADA.did)).resolves.toEqual({
      ok: true,
      value: { value: invalid.value, cid: invalid.cid, valid: false },
    });
  });

  it('returns a null config when the person has not customised their lanyard', async () => {
    serve({ config: false });
    await expect(fetchLanyardConfig(ADA.did)).resolves.toEqual({
      ok: true,
      value: null,
    });
  });
});
