import type { Did } from '@atcute/lexicons';

import { getRecord, listRecords } from '@/lib/atproto/pds';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { validateRecord, validRecords } from '@/lib/lexicons/validate';
import { ok, type Result } from '@/lib/sources/result';

import type {
  LanyardConfigRecord,
  LanyardRecords,
  MediaLink,
} from './lanyards.types';
import { isMediaKind, itemFromLegacy, type MediaKind } from './media';

/**
 * The most kept records read per collection: all of anyone's in practice
 * (listRecords pages through them 100 at a time), while a PDS that never
 * stops paging can't keep the lanyard loading forever.
 */
const LIST_LIMIT = 500;

/** The fields of an app.lanyards.media.item that the lanyard shows. */
type ItemRecord = {
  url: string;
  kind: string;
  platform?: string;
  title?: string;
  description?: string;
  type?: string;
  publishedAt?: string;
};

function toMedia(
  uri: string,
  value: ItemRecord & { kind: MediaLink['kind'] },
  legacy: boolean
): MediaLink {
  return {
    key: uri,
    kind: value.kind,
    url: value.url,
    ...(value.platform ? { platform: value.platform } : {}),
    ...(value.title ? { title: value.title } : {}),
    ...(value.description ? { description: value.description } : {}),
    ...(value.type ? { type: value.type } : {}),
    ...(value.publishedAt ? { publishedAt: value.publishedAt } : {}),
    ...(legacy ? { legacy: true as const } : {}),
  };
}

/**
 * The owner's app.lanyards.actor.lanyard config, or null when they have none
 * (or it is invalid). Read on its own, so a failing list elsewhere can never
 * replace the owner's choices with the defaults.
 */
export async function fetchLanyardConfig(
  did: Did,
  signal?: AbortSignal
): Promise<Result<LanyardConfigRecord | null>> {
  const config = await getRecord(
    'lanyards',
    did,
    LANYARDS_NSID.lanyard,
    'self',
    signal
  );
  if (!config.ok) return config;
  if (!config.value) return ok(null);
  return ok({
    value: config.value.value,
    cid: config.value.cid,
    valid: validateRecord(LANYARDS_NSID.lanyard, config.value.value).ok,
  });
}

/**
 * The person's kept Lanyards records: their podcasts and videos, from the
 * one record type and, until each moves, the two legacy ones (#132).
 */
export async function fetchLanyardRecords(
  did: Did,
  signal?: AbortSignal
): Promise<Result<LanyardRecords>> {
  const list = (collection: string) =>
    listRecords('lanyards', did, collection, { limit: LIST_LIMIT, signal });
  // Links come from Sifa and Bluesky, and the title from Sifa: old web-link
  // and honorific records stay in the repository, unread.
  const [items, audio, video] = await Promise.all([
    list(LANYARDS_NSID.mediaItem),
    list(LANYARDS_NSID.legacyAudio),
    list(LANYARDS_NSID.legacyVideo),
  ]);
  if (!items.ok) return items;
  if (!audio.ok) return audio;
  if (!video.ok) return video;

  const legacy = (kind: MediaKind, records: typeof audio.value) =>
    validRecords<Record<string, unknown>>(
      kind === 'audio' ? LANYARDS_NSID.legacyAudio : LANYARDS_NSID.legacyVideo,
      records
    ).map(({ uri, value }) =>
      toMedia(
        uri,
        itemFromLegacy(kind, value) as ItemRecord & { kind: MediaKind },
        true
      )
    );

  return ok({
    media: [
      // An item of a kind this app doesn't know yet is left out.
      ...validRecords<ItemRecord>(LANYARDS_NSID.mediaItem, items.value).flatMap(
        ({ uri, value }) =>
          isMediaKind(value.kind)
            ? [toMedia(uri, { ...value, kind: value.kind }, false)]
            : []
      ),
      ...legacy('audio', audio.value),
      ...legacy('video', video.value),
    ],
  });
}
