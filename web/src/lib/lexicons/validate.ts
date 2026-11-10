import { AppBskyGraphFollow } from '@atcute/bluesky';
import { safeParse } from '@atcute/lexicons/validations';

import {
  AppLanyardsActorBiographyHonorific,
  AppLanyardsActorLanyard,
  AppLanyardsLinkMediaAudio,
  AppLanyardsLinkMediaVideo,
  AppLanyardsLinkWeb,
  IdSifaProfileEducation,
  IdSifaProfileExternalAccount,
  IdSifaProfileLocation,
  IdSifaProfilePosition,
  IdSifaProfilePresentation,
  IdSifaProfilePresentationDelivery,
  IdSifaProfilePublication,
  IdSifaProfileSelf,
  IdSifaProfileSkill,
  NetworkCosmikCard,
  NetworkCosmikCollection,
  NetworkCosmikCollectionLink,
  OrgTangledRepoDeclaration,
  OrgTangledRepoManifest,
  SiteStandardDocument,
  SiteStandardPublication,
} from '@/lexicons';

/**
 * Record schemas Lanyards writes (its own collections and follows) or reads
 * from other people's repositories, keyed by collection NSID.
 */
const RECORD_SCHEMAS = {
  'app.lanyards.actor.lanyard': AppLanyardsActorLanyard.mainSchema,
  'app.lanyards.actor.biography.honorific':
    AppLanyardsActorBiographyHonorific.mainSchema,
  'app.lanyards.link.web': AppLanyardsLinkWeb.mainSchema,
  'app.lanyards.link.media.audio': AppLanyardsLinkMediaAudio.mainSchema,
  'app.lanyards.link.media.video': AppLanyardsLinkMediaVideo.mainSchema,
  'app.bsky.graph.follow': AppBskyGraphFollow.mainSchema,
  'id.sifa.profile.self': IdSifaProfileSelf.mainSchema,
  'id.sifa.profile.position': IdSifaProfilePosition.mainSchema,
  'id.sifa.profile.education': IdSifaProfileEducation.mainSchema,
  'id.sifa.profile.skill': IdSifaProfileSkill.mainSchema,
  'id.sifa.profile.externalAccount': IdSifaProfileExternalAccount.mainSchema,
  'id.sifa.profile.publication': IdSifaProfilePublication.mainSchema,
  'id.sifa.profile.presentation': IdSifaProfilePresentation.mainSchema,
  'id.sifa.profile.presentationDelivery':
    IdSifaProfilePresentationDelivery.mainSchema,
  'id.sifa.profile.location': IdSifaProfileLocation.mainSchema,
  'site.standard.document': SiteStandardDocument.mainSchema,
  'site.standard.publication': SiteStandardPublication.mainSchema,
  'org.tangled.repo.declaration': OrgTangledRepoDeclaration.mainSchema,
  'org.tangled.repo.manifest': OrgTangledRepoManifest.mainSchema,
  'network.cosmik.collection': NetworkCosmikCollection.mainSchema,
  'network.cosmik.collectionLink': NetworkCosmikCollectionLink.mainSchema,
  'network.cosmik.card': NetworkCosmikCard.mainSchema,
} as const;

export type KnownRecordNsid = keyof typeof RECORD_SCHEMAS;

export type RecordValidation =
  { ok: true; value: unknown } | { ok: false; message: string };

/**
 * Removes `null` object properties at any depth. Some apps write `null` for
 * absent optional fields, which lexicon validation would otherwise reject.
 * Array items are kept as they are.
 */
export function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item: unknown) =>
      item === null ? item : stripNulls(item)
    ) as T;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== null)
      .map(([key, item]) => [key, stripNulls(item)]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

/** Validates a record against its pinned lexicon, after `stripNulls`. */
export function validateRecord(
  nsid: KnownRecordNsid,
  value: unknown
): RecordValidation {
  const result = safeParse(RECORD_SCHEMAS[nsid], stripNulls(value));
  return result.ok
    ? { ok: true, value: result.value }
    : { ok: false, message: result.message };
}

/**
 * Keeps the records that pass their lexicon, as `{ uri, value }`. Invalid
 * records are dropped one by one, never failing the whole list.
 */
export function validRecords<T>(
  nsid: KnownRecordNsid,
  records: readonly { uri: string; value: unknown }[]
): { uri: string; value: T }[] {
  return records.flatMap((record) => {
    const result = validateRecord(nsid, record.value);
    return result.ok ? [{ uri: record.uri, value: result.value as T }] : [];
  });
}
