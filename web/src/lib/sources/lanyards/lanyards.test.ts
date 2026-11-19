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

function serve(options: { config?: boolean; honorific?: string } = {}) {
  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(
    ADA.pds,
    ADA.did,
    LANYARD,
    'self',
    options.config === false ? null : records.config
  );
  mockGetRecord(
    ADA.pds,
    ADA.did,
    HONORIFIC,
    'self',
    options.honorific
      ? {
          ...records.honorific,
          value: { ...records.honorific.value, value: options.honorific },
        }
      : records.honorific
  );
  mockListRecords(ADA.pds, ADA.did, 'app.lanyards.link.web', records.webLinks);
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

  it('reads only podcasts and videos', async () => {
    const asked: string[] = [];
    const listen = ({ request }: { request: Request }) => {
      const url = new URL(request.url);
      asked.push(url.searchParams.get('collection') ?? '');
    };
    server.events.on('request:start', listen);
    const result = await fetchLanyardRecords(ADA.did);
    server.events.removeListener('request:start', listen);
    // Web links and the honorific are no longer Lanyards' to show.
    expect(asked).not.toContain('app.lanyards.link.web');
    expect(asked).not.toContain(HONORIFIC);
    expect(result).toEqual({
      ok: true,
      value: {
        media: [
          {
            key: `at://${ADA.did}/app.lanyards.link.media.audio/3maudio`,
            kind: 'audio',
            url: 'https://podcasts.example/episode-12',
            platform: 'apple-podcasts',
            title: 'Talking protocols',
            type: 'interview',
          },
          {
            key: `at://${ADA.did}/app.lanyards.link.media.video/3mvideo`,
            kind: 'video',
            url: 'https://youtube.com/watch?v=fixture',
            platform: 'youtube',
            title: 'Keynote recording',
            type: 'conference-talk',
            publishedDate: '2025-06-12T09:00:00.000Z',
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
