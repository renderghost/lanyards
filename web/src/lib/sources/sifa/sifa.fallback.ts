import type { Did } from '@atcute/lexicons';

import { listRecords, type RawRecord } from '@/lib/atproto/pds';
import { type KnownRecordNsid, validateRecord } from '@/lib/lexicons/validate';
import { ok, type Result } from '@/lib/sources/result';

import {
  byDateDescending,
  defined,
  normalisePlatform,
  stripDefsToken,
  toOpenTo,
} from './sifa.shared';
import type { SifaProfile, SifaTalk } from './sifa.types';

const COLLECTIONS = [
  'self',
  'position',
  'education',
  'skill',
  'externalAccount',
  'publication',
  'presentation',
  'presentationDelivery',
  'location',
] as const;

type Collection = (typeof COLLECTIONS)[number];
type Item = { uri: string; value: Record<string, unknown> };

const RECORD_LIMIT = 100;

const str = (value: unknown) => (typeof value === 'string' ? value : undefined);
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

const regionNames = new Intl.DisplayNames(['en-GB'], { type: 'region' });

function formatAddress(address: unknown): string | undefined {
  if (!address || typeof address !== 'object') return undefined;
  const { locality, region, country } = address as Record<string, unknown>;
  let countryName = str(country);
  if (countryName && /^[A-Z]{2}$/.test(countryName)) {
    countryName = regionNames.of(countryName) ?? countryName;
  }
  const parts = [str(locality), str(region), countryName].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

function valid(collection: Collection, records: RawRecord[]): Item[] {
  const nsid = `id.sifa.profile.${collection}` as KnownRecordNsid;
  return records.flatMap((record) => {
    const result = validateRecord(nsid, record.value);
    return result.ok
      ? [{ uri: record.uri, value: result.value as Record<string, unknown> }]
      : [];
  });
}

function avatarUrl(did: Did, avatar: unknown): string | undefined {
  const cid = (avatar as { ref?: { $link?: unknown } } | undefined)?.ref?.$link;
  return typeof cid === 'string'
    ? `https://cdn.bsky.app/img/avatar_thumbnail/plain/${did}/${cid}@jpeg`
    : undefined;
}

function firstLink(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined;
  return str((value[0] as { uri?: unknown } | undefined)?.uri);
}

/**
 * Builds a Sifa profile from the person's id.sifa.profile.* records. Used only
 * when Sifa's AppView fails. Unlike the view, records include items the
 * person hid on Sifa (accepted by the owner, 2026-11-10).
 */
export async function fetchSifaRecords(
  did: Did,
  signal?: AbortSignal
): Promise<Result<SifaProfile | null>> {
  const results = await Promise.all(
    COLLECTIONS.map((collection) =>
      listRecords('sifa', did, `id.sifa.profile.${collection}`, {
        limit: RECORD_LIMIT,
        signal,
      })
    )
  );
  const failure = results.find((result) => !result.ok);
  if (failure && !failure.ok) return failure;

  const items = Object.fromEntries(
    COLLECTIONS.map((collection, index) => {
      const result = results[index];
      return [collection, result?.ok ? valid(collection, result.value) : []];
    })
  ) as Record<Collection, Item[]>;

  if (COLLECTIONS.every((collection) => items[collection].length === 0)) {
    return ok(null);
  }

  const self = items.self[0]?.value ?? {};
  const location =
    items.location.find((item) => item.value.isPrimary === true) ??
    items.location[0];
  const presentations = new Map(
    items.presentation.map((item) => [item.uri, item.value])
  );

  const talks: SifaTalk[] = items.presentationDelivery.flatMap((item) => {
    const ref = (item.value.presentationRef as { uri?: unknown } | undefined)
      ?.uri;
    const presentation =
      typeof ref === 'string' ? presentations.get(ref) : undefined;
    const title = str(item.value.title) ?? str(presentation?.title);
    if (!title) return [];
    const role = str(item.value.role);
    return [
      defined<SifaTalk>({
        key: item.uri,
        title,
        eventName: str(item.value.eventName),
        date: str(item.value.date),
        role: role ? stripDefsToken(role) : undefined,
        url: firstLink(item.value.links) ?? firstLink(presentation?.links),
      }),
    ];
  });

  return ok({
    ...defined({
      displayName: str(self.displayName),
      avatar: avatarUrl(did, self.avatar),
      pronouns: str(self.pronouns),
      headline: str(self.headline),
      location: formatAddress(location?.value.address),
    }),
    langs: strings(self.langs),
    openTo: toOpenTo(strings(self.openTo)),
    positions: items.position.map((item) =>
      defined({
        key: item.uri,
        title: String(item.value.title),
        company: str(item.value.company),
        startedAt: str(item.value.startedAt),
        endedAt: str(item.value.endedAt),
        isPrimary: item.value.isPrimary === true,
      })
    ),
    education: items.education.map((item) =>
      defined({
        key: item.uri,
        institution: String(item.value.institution),
        degree: str(item.value.degree),
        fieldOfStudy: str(item.value.fieldOfStudy),
        startedAt: str(item.value.startedAt),
        endedAt: str(item.value.endedAt),
      })
    ),
    skills: items.skill.map((item) => ({
      key: item.uri,
      name: String(item.value.name),
    })),
    externalAccounts: items.externalAccount.map((item) =>
      defined({
        key: item.uri,
        url: String(item.value.url),
        platform: normalisePlatform(String(item.value.platform)),
        label: str(item.value.label),
      })
    ),
    publications: items.publication.map((item) =>
      defined({
        key: item.uri,
        title: String(item.value.title),
        doi: str(item.value.doi),
        url: str(item.value.url),
        date: str(item.value.publishedAt),
        venue: str(item.value.publisher),
      })
    ),
    talks: talks.sort(byDateDescending),
  });
}
