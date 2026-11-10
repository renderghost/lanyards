import { beforeEach, describe, expect, it } from 'vitest';

import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { ADA } from '@/test/people';

import cards from './fixtures/cards.json';
import collectionLinks from './fixtures/collectionLinks.json';
import collections from './fixtures/collections.json';
import { fetchCollections } from './semble';

beforeEach(() => {
  mockDidDocument(ADA.did, ADA.pds);
  mockListRecords(
    ADA.pds,
    ADA.did,
    'network.cosmik.collection',
    collections.records
  );
  mockListRecords(
    ADA.pds,
    ADA.did,
    'network.cosmik.collectionLink',
    collectionLinks.records
  );
  mockListRecords(ADA.pds, ADA.did, 'network.cosmik.card', cards.records);
});

const at = (collection: string, rkey: string) =>
  `at://${ADA.did}/network.cosmik.${collection}/${rkey}`;

describe('fetchCollections', () => {
  it('shows the person’s collections with their own URL cards, newest link first', async () => {
    const result = await fetchCollections(ADA.did, 'alice.test', 10);
    expect(result).toEqual({
      ok: true,
      value: [
        {
          key: at('collection', '3mcolone'),
          name: 'Protocol reading',
          description: 'Papers and posts about ATProto',
          url: 'https://semble.so/profile/alice.test/collections/3mcolone',
          links: [
            {
              key: at('card', '3mcardtwo'),
              title: 'A blog post',
              url: 'https://blog.example/post',
            },
            {
              key: at('card', '3mcardone'),
              title: 'The protocol spec',
              url: 'https://protocol.example/spec',
              siteName: 'Protocol Example',
            },
          ],
        },
        {
          key: at('collection', '3mcoltwo'),
          name: 'Conference talks',
          url: 'https://semble.so/profile/alice.test/collections/3mcoltwo',
          links: [],
        },
      ],
    });
  });

  it('returns at most the limit of collections', async () => {
    const result = await fetchCollections(ADA.did, 'alice.test', 1);
    expect(result.ok && result.value.map((c) => c.name)).toEqual([
      'Protocol reading',
    ]);
  });
});
