import type { Did } from '@atcute/lexicons';

import { CANONICAL_ORIGIN, ORCID_API } from '@/lib/atproto/endpoints';
import { normaliseDoi, normaliseUrl, safeHref } from '@/lib/normalise';
import { requestJson } from '@/lib/sources/request';
import { err, ok, type Result } from '@/lib/sources/result';
import type { SifaAccount } from '@/lib/sources/sifa/sifa.types';

import type { OrcidWork } from './orcid.types';

const ORCID_ID = /\d{4}-\d{4}-\d{4}-\d{3}[\dX]/;
const ORCID_HOST = /(^|\.)orcid\.org$/i;

/** Checks an ORCID iD's ISO 7064 MOD 11-2 check digit. */
export function isValidOrcid(id: string): boolean {
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(id)) return false;
  const digits = id.replaceAll('-', '');
  let total = 0;
  for (const digit of digits.slice(0, 15)) {
    total = (total + Number(digit)) * 2;
  }
  const remainder = (12 - (total % 11)) % 11;
  const check = remainder === 10 ? 'X' : String(remainder);
  return digits[15] === check;
}

/** The person's ORCID iD, from an ORCID account or any orcid.org link. */
export function findOrcidId(accounts: SifaAccount[]): string | undefined {
  for (const account of accounts) {
    let host: string;
    try {
      host = new URL(account.url).hostname;
    } catch {
      continue;
    }
    if (account.platform !== 'orcid' && !ORCID_HOST.test(host)) continue;
    const id = ORCID_ID.exec(account.url)?.[0];
    if (id && isValidOrcid(id)) return id;
  }
  return undefined;
}

/** ORCID answers 503 when its anonymous burst limit is exceeded. */
async function orcidJson(url: string, signal?: AbortSignal) {
  const response = await requestJson('orcid', url, signal);
  if (!response.ok && response.error.status === 503) {
    return err('orcid', 'rateLimited', { status: 503 });
  }
  return response;
}

type Value = { value?: unknown } | null | undefined;
type ExternalId = {
  'external-id-type'?: unknown;
  'external-id-value'?: unknown;
  'external-id-relationship'?: unknown;
};
type WorkSummary = {
  'put-code'?: unknown;
  title?: { title?: Value } | null;
  'external-ids'?: { 'external-id'?: ExternalId[] } | null;
  'publication-date'?: { year?: Value } | null;
  'journal-title'?: Value;
  url?: Value;
};

const text = (value: Value) =>
  typeof value?.value === 'string' ? value.value : undefined;

/** The works on a public ORCID record, newest first. */
export async function fetchOrcidWorks(
  id: string,
  signal?: AbortSignal
): Promise<Result<OrcidWork[]>> {
  const response = await orcidJson(`${ORCID_API}/${id}/works`, signal);
  if (!response.ok) return response;
  const groups = (response.value as { group?: unknown }).group;
  if (!Array.isArray(groups)) return err('orcid', 'invalid');

  const works = groups.flatMap((group: { 'work-summary'?: WorkSummary[] }) => {
    // ORCID lists the preferred version of each work first.
    const summary = group['work-summary']?.[0];
    const title = text(summary?.title?.title);
    if (!summary || !title) return [];
    // Only the work's own DOI: part-of names its journal or book, and
    // version-of another version (a preprint's published paper).
    const doiId = summary['external-ids']?.['external-id']?.find(
      (item) =>
        item['external-id-type'] === 'doi' &&
        item['external-id-relationship'] === 'self'
    );
    const doiValue = doiId?.['external-id-value'];
    const doi =
      typeof doiValue === 'string' ? normaliseDoi(doiValue) : undefined;
    const year = text(summary['publication-date']?.year);
    const venue = text(summary['journal-title']);
    const rawUrl = text(summary.url);
    const url = rawUrl ? safeHref(rawUrl) : undefined;
    return [
      {
        key: `orcid:${id}/${String(summary['put-code'])}`,
        title,
        ...(doi ? { doi } : {}),
        ...(year ? { year } : {}),
        ...(venue ? { venue } : {}),
        ...(url ? { url } : {}),
      },
    ];
  });

  return ok(
    works
      .map((work, index) => ({ work, index }))
      .sort(
        (a, b) =>
          (b.work.year ?? '').localeCompare(a.work.year ?? '') ||
          a.index - b.index
      )
      .map(({ work }) => work)
  );
}

/**
 * True when the public ORCID record's researcher URLs link back to the
 * person's lanyard or Bluesky profile (the two-way check, spec §7.8).
 */
export async function fetchOrcidVerified(
  id: string,
  did: Did,
  signal?: AbortSignal
): Promise<Result<boolean>> {
  const response = await orcidJson(
    `${ORCID_API}/${id}/researcher-urls`,
    signal
  );
  if (!response.ok) return response;
  const entries = (response.value as { 'researcher-url'?: unknown })[
    'researcher-url'
  ];
  if (!Array.isArray(entries)) return err('orcid', 'invalid');

  const accepted = new Set(
    [`${CANONICAL_ORIGIN}/d/${did}`, `https://bsky.app/profile/${did}`].map(
      (url) => normaliseUrl(url)
    )
  );
  return ok(
    entries.some((entry: { url?: Value }) => {
      const url = text(entry.url);
      return url ? accepted.has(normaliseUrl(url)) : false;
    })
  );
}
