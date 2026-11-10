import { beforeEach, describe, expect, it } from 'vitest';

import {
  mockDidDocument,
  mockGetRecord,
  mockListRecords,
} from '@/test/handlers';
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

  it('reads the config, honorific, web links and media', async () => {
    const result = await fetchLanyardRecords(ADA.did);
    expect(result).toEqual({
      ok: true,
      value: {
        honorific: 'Dr',
        webLinks: [
          {
            key: `at://${ADA.did}/app.lanyards.link.web/3mwebone`,
            url: 'https://ada.example/cv',
            title: 'CV',
          },
        ],
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

  it('treats the honorific none as no honorific', async () => {
    serve({ honorific: 'none' });
    const result = await fetchLanyardRecords(ADA.did);
    expect(result.ok && result.value.honorific).toBeUndefined();
  });

  it('reads the config on its own', async () => {
    await expect(fetchLanyardConfig(ADA.did)).resolves.toEqual({
      ok: true,
      value: { value: records.config.value, cid: records.config.cid },
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
