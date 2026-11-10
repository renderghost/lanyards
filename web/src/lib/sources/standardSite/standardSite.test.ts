import { beforeEach, describe, expect, it } from 'vitest';

import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { ADA } from '@/test/people';

import documents from './fixtures/documents.json';
import publications from './fixtures/publications.json';
import { fetchBlogPosts } from './standardSite';

beforeEach(() => {
  mockDidDocument(ADA.did, ADA.pds);
  mockListRecords(
    ADA.pds,
    ADA.did,
    'site.standard.document',
    documents.records
  );
  mockListRecords(
    ADA.pds,
    ADA.did,
    'site.standard.publication',
    publications.records
  );
});

const key = (rkey: string) => `at://${ADA.did}/site.standard.document/${rkey}`;

describe('fetchBlogPosts', () => {
  it('builds each post URL from its publication or site, newest first', async () => {
    const result = await fetchBlogPosts(ADA.did, 10);
    expect(result).toEqual({
      ok: true,
      value: [
        {
          key: key('3mdocloose'),
          title: 'A loose note',
          url: 'https://loose.example/@alice.test/notes',
          publishedAt: '2026-10-05T09:00:00.000Z',
        },
        {
          key: key('3mdocone'),
          title: 'First post',
          url: 'https://ada.leaflet.pub/first-post',
          publicationName: "Ada's notes",
          publishedAt: '2026-10-01T09:00:00.000Z',
        },
        {
          key: key('3mdocnopath'),
          title: 'Post without a path',
          url: 'https://ada.leaflet.pub/',
          publicationName: "Ada's notes",
          publishedAt: '2026-09-01T09:00:00.000Z',
        },
      ],
    });
  });

  it('drops posts with unsafe URLs and records that fail their schema', async () => {
    const result = await fetchBlogPosts(ADA.did, 10);
    const titles = result.ok ? result.value.map((post) => post.title) : [];
    expect(titles).not.toContain('Unsafe site');
    expect(titles).toHaveLength(3);
  });

  it('returns at most the limit', async () => {
    const result = await fetchBlogPosts(ADA.did, 1);
    expect(result.ok && result.value.map((post) => post.title)).toEqual([
      'A loose note',
    ]);
  });
});
