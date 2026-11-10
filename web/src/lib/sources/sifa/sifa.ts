import type { Did } from '@atcute/lexicons';
import { type BaseSchema, safeParse } from '@atcute/lexicons/validations';

import { IdSifaGetProfileView } from '@/lexicons';
import { avatarThumbnail } from '@/lib/atproto/avatar';
import { SIFA_APPVIEW } from '@/lib/atproto/endpoints';
import { stripNulls } from '@/lib/lexicons/validate';
import { requestJson } from '@/lib/sources/request';
import { err, ok, type Result } from '@/lib/sources/result';

import { fetchSifaRecords } from './sifa.fallback';
import {
  byDateDescending,
  defined,
  normalisePlatform,
  sifaUri,
  stripDefsToken,
  toOpenTo,
} from './sifa.shared';
import type { SifaProfile, SifaTalk } from './sifa.types';

type View = IdSifaGetProfileView.ProfileView;
type PositionView = IdSifaGetProfileView.PositionView;
type EducationView = IdSifaGetProfileView.EducationView;
type SkillView = IdSifaGetProfileView.SkillView;
type AccountView = IdSifaGetProfileView.ExternalAccountView;
type PublicationView = IdSifaGetProfileView.PublicationView;
type PresentationView = IdSifaGetProfileView.PresentationView;
type DeliveryView = IdSifaGetProfileView.PresentationDeliveryView;

const ARRAY_FIELDS = [
  'positions',
  'education',
  'skills',
  'externalAccounts',
  'publications',
  'presentations',
  'presentationDeliveries',
] as const;

/** Failures that mean Sifa itself is unwell, so its records are read instead. */
const FALLBACK_KINDS = new Set([
  'network',
  'timeout',
  'rateLimited',
  'server',
  'invalid',
]);

/** Keeps the items that pass `schema`; one bad item never sinks the rest. */
function validItems<T>(schema: BaseSchema, items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    const result = safeParse(schema, stripNulls(item));
    return result.ok ? [result.value as T] : [];
  });
}

const firstLink = (links: { uri: string }[] | undefined) => links?.[0]?.uri;

function mapTalks(
  did: Did,
  presentations: PresentationView[],
  deliveries: DeliveryView[]
): SifaTalk[] {
  const delivery = (item: DeliveryView, title: string, fallbackUrl?: string) =>
    defined<SifaTalk>({
      key: sifaUri(did, 'presentationDelivery', item.rkey),
      title,
      eventName: item.eventName,
      date: item.date,
      role: item.role ? stripDefsToken(item.role) : undefined,
      url: firstLink(item.links) ?? fallbackUrl,
    });

  const delivered = presentations.flatMap((presentation) =>
    presentation.deliveries.length
      ? presentation.deliveries.map((item) =>
          delivery(item, presentation.title, firstLink(presentation.links))
        )
      : [
          defined<SifaTalk>({
            key: sifaUri(did, 'presentation', presentation.rkey),
            title: presentation.title,
            url: firstLink(presentation.links),
          }),
        ]
  );
  const standalone = deliveries.flatMap((item) =>
    item.title ? [delivery(item, item.title)] : []
  );
  return [...delivered, ...standalone].sort(byDateDescending);
}

function mapView(did: Did, raw: Record<string, unknown>): SifaProfile | null {
  const scalars = Object.fromEntries(
    Object.entries(stripNulls(raw)).filter(
      ([key]) => !(ARRAY_FIELDS as readonly string[]).includes(key)
    )
  );
  const top = safeParse(IdSifaGetProfileView.profileViewSchema, scalars);
  if (!top.ok) return null;
  const view = top.value as View;
  const S = IdSifaGetProfileView;

  const positions = validItems<PositionView>(
    S.positionViewSchema,
    raw.positions
  );
  const education = validItems<EducationView>(
    S.educationViewSchema,
    raw.education
  );
  const skills = validItems<SkillView>(S.skillViewSchema, raw.skills);
  const accounts = validItems<AccountView>(
    S.externalAccountViewSchema,
    raw.externalAccounts
  );
  const publications = validItems<PublicationView>(
    S.publicationViewSchema,
    raw.publications
  );
  const presentations = validItems<PresentationView>(
    S.presentationViewSchema,
    raw.presentations
  );
  const deliveries = validItems<DeliveryView>(
    S.presentationDeliveryViewSchema,
    raw.presentationDeliveries
  );

  return {
    ...defined({
      handle: view.handle,
      displayName: view.displayName,
      avatar: view.avatar ? avatarThumbnail(view.avatar) : undefined,
      pronouns: view.pronouns,
      headline: view.headline,
      location: view.location,
    }),
    langs: view.langs ?? [],
    openTo: toOpenTo(view.openTo),
    positions: positions.map((item) =>
      defined({
        key: sifaUri(did, 'position', item.rkey),
        title: item.title,
        company: item.company ?? item.currentCompanyName,
        startedAt: item.startedAt,
        endedAt: item.endedAt,
        isPrimary: item.primary ?? false,
      })
    ),
    education: education.flatMap((item) =>
      item.institution
        ? [
            defined({
              key: sifaUri(did, 'education', item.rkey),
              institution: item.institution,
              degree: item.degree,
              fieldOfStudy: item.fieldOfStudy,
              startedAt: item.startedAt,
              endedAt: item.endedAt,
            }),
          ]
        : []
    ),
    skills: skills.map((item) => ({
      key: sifaUri(did, 'skill', item.rkey),
      name: item.name,
    })),
    externalAccounts: accounts.map((item) =>
      defined({
        key: sifaUri(did, 'externalAccount', item.rkey),
        url: item.url,
        platform: normalisePlatform(String(item.platform ?? 'other')),
        label: item.label,
      })
    ),
    publications: publications
      // Sifa merges standard.site posts in; Lanyards shows those as blog posts.
      .filter((item) => !item.rkey.startsWith('std-at://'))
      .map((item) =>
        defined({
          key: sifaUri(did, 'publication', item.rkey),
          title: item.title,
          doi: item.doi,
          url: item.url,
          date: item.date,
          venue: item.publisher ?? item.publicationName,
        })
      ),
    talks: mapTalks(did, presentations, deliveries),
  };
}

/**
 * The person's Sifa professional profile, or null when they have none.
 * Reads Sifa's AppView, which omits items hidden on Sifa; when the view
 * fails, reads their Sifa records from the PDS instead.
 */
export async function fetchSifaProfile(
  did: Did,
  signal?: AbortSignal
): Promise<Result<SifaProfile | null>> {
  const url = `${SIFA_APPVIEW}/xrpc/id.sifa.getProfileView?${new URLSearchParams({ actor: did })}`;
  const response = await requestJson('sifa', url, signal);

  if (response.ok) {
    const value = response.value;
    const profile =
      value && typeof value === 'object'
        ? mapView(did, value as Record<string, unknown>)
        : null;
    if (profile) return ok(profile);
  } else if (response.error.code === 'ProfileNotFound') {
    return ok(null);
  } else if (!FALLBACK_KINDS.has(response.error.kind)) {
    return response;
  }

  const fallback = await fetchSifaRecords(did, signal);
  return fallback.ok ? fallback : err('sifa', 'server');
}
