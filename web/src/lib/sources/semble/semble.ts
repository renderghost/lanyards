import type { Did, Handle } from '@atcute/lexicons';

import { profileId } from '@/lib/atproto/profileId';
import { listRecords } from '@/lib/atproto/pds';
import { validRecords } from '@/lib/lexicons/validate';
import { safeHref } from '@/lib/normalise';
import { ok, type Result } from '@/lib/sources/result';

import type { SembleCollection, SembleLink } from './semble.types';

const COLLECTION_LIMIT = 50;
const LINK_LIMIT = 100;
const LINKS_PER_COLLECTION = 3;

type Collection = {
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};
type CollectionLink = {
  collection: { uri: string };
  card: { uri: string };
  addedAt: string;
};
type Card = {
  type: string;
  url?: string;
  content?: {
    url?: string;
    metadata?: { title?: string; siteName?: string };
  };
};

const rkeyOf = (uri: string) => uri.split('/').pop() ?? '';

function toLink(uri: string, card: Card): SembleLink | null {
  if (card.type !== 'URL') return null;
  const raw = card.content?.url ?? card.url;
  const url = raw ? safeHref(raw) : undefined;
  if (!url) return null;
  const metadata = card.content?.metadata;
  return {
    key: uri,
    title: metadata?.title ?? new URL(url).hostname,
    url,
    ...(metadata?.siteName ? { siteName: metadata.siteName } : {}),
  };
}

/**
 * The person's Semble collections, most recently updated first, each with
 * its latest URL cards. Only cards in the person's own repository are shown,
 * and no card images are loaded.
 */
export async function fetchCollections(
  did: Did,
  handle: Handle | string,
  limit: number,
  signal?: AbortSignal
): Promise<Result<SembleCollection[]>> {
  const read = (collection: string, max: number) =>
    listRecords('semble', did, collection, { limit: max, signal });
  const [collections, links, cards] = await Promise.all([
    read('network.cosmik.collection', COLLECTION_LIMIT),
    read('network.cosmik.collectionLink', LINK_LIMIT),
    read('network.cosmik.card', LINK_LIMIT),
  ]);
  if (!collections.ok) return collections;
  if (!links.ok) return links;
  if (!cards.ok) return cards;

  const cardLinks = new Map(
    validRecords<Card>('network.cosmik.card', cards.value).flatMap(
      ({ uri, value }) => {
        const link = toLink(uri, value);
        return link ? [[uri, link] as const] : [];
      }
    )
  );

  const linksByCollection = new Map<
    string,
    { addedAt: string; link: SembleLink }[]
  >();
  for (const { value } of validRecords<CollectionLink>(
    'network.cosmik.collectionLink',
    links.value
  )) {
    const link = cardLinks.get(value.card.uri);
    if (!link) continue;
    const list = linksByCollection.get(value.collection.uri) ?? [];
    list.push({ addedAt: value.addedAt, link });
    linksByCollection.set(value.collection.uri, list);
  }

  const result = validRecords<Collection>(
    'network.cosmik.collection',
    collections.value
  )
    .sort((a, b) =>
      (b.value.updatedAt ?? b.value.createdAt ?? '').localeCompare(
        a.value.updatedAt ?? a.value.createdAt ?? ''
      )
    )
    .slice(0, limit)
    .map(({ uri, value }) => ({
      key: uri,
      name: value.name,
      ...(value.description ? { description: value.description } : {}),
      url: `https://semble.so/profile/${profileId(did, handle)}/collections/${rkeyOf(uri)}`,
      links: (linksByCollection.get(uri) ?? [])
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        .slice(0, LINKS_PER_COLLECTION)
        .map(({ link }) => link),
    }));

  return ok(result);
}
