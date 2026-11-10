import type { Did } from '@atcute/lexicons';

import { listRecords } from '@/lib/atproto/pds';
import { validRecords } from '@/lib/lexicons/validate';
import { safeHref } from '@/lib/normalise';
import { ok, type Result } from '@/lib/sources/result';

import type { BlogPost } from './standardSite.types';

const DOCUMENT_LIMIT = 50;
const PUBLICATION_LIMIT = 20;

type Document = {
  site: string;
  path?: string;
  title: string;
  publishedAt: string;
};
type Publication = { url: string; name: string };

const join = (base: string, path?: string) =>
  path
    ? `${base.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
    : base;

/** The person's latest standard.site posts, newest first. */
export async function fetchBlogPosts(
  did: Did,
  limit: number,
  signal?: AbortSignal
): Promise<Result<BlogPost[]>> {
  const [documents, publications] = await Promise.all([
    listRecords('standardSite', did, 'site.standard.document', {
      limit: DOCUMENT_LIMIT,
      signal,
    }),
    listRecords('standardSite', did, 'site.standard.publication', {
      limit: PUBLICATION_LIMIT,
      signal,
    }),
  ]);
  if (!documents.ok) return documents;
  if (!publications.ok) return publications;

  const byUri = new Map(
    validRecords<Publication>(
      'site.standard.publication',
      publications.value
    ).map((publication) => [publication.uri, publication.value])
  );

  const posts = validRecords<Document>(
    'site.standard.document',
    documents.value
  )
    .flatMap(({ uri, value }) => {
      const publication = byUri.get(value.site);
      const base = publication ? publication.url : value.site;
      // A site that is an AT-URI of a publication we can't see has no URL.
      if (!publication && value.site.startsWith('at://')) return [];
      const url = safeHref(join(base, value.path));
      if (!url) return [];
      return [
        {
          key: uri,
          title: value.title,
          url,
          ...(publication ? { publicationName: publication.name } : {}),
          publishedAt: value.publishedAt,
        },
      ];
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return ok(posts.slice(0, limit));
}
