import type { Did } from '@atcute/lexicons';

import { getRecord, listRecords } from '@/lib/atproto/pds';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { validateRecord, validRecords } from '@/lib/lexicons/validate';
import { ok, type Result } from '@/lib/sources/result';

import type {
  LanyardConfigRecord,
  LanyardRecords,
  MediaLink,
  WebLink,
} from './lanyards.types';

const LIST_LIMIT = 20;

type WebRecord = { url: string; title?: string };
type MediaRecord = {
  url: string;
  platform: string;
  title?: string;
  description?: string;
  type?: string;
  publishedDate?: string;
};

function toMedia(
  kind: MediaLink['kind'],
  items: { uri: string; value: MediaRecord }[]
): MediaLink[] {
  return items.map(({ uri, value }) => ({
    key: uri,
    kind,
    url: value.url,
    platform: value.platform,
    ...(value.title ? { title: value.title } : {}),
    ...(value.description ? { description: value.description } : {}),
    ...(value.type ? { type: value.type } : {}),
    ...(value.publishedDate ? { publishedDate: value.publishedDate } : {}),
  }));
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

/** The person's kept Lanyards records: honorific, web links and media. */
export async function fetchLanyardRecords(
  did: Did,
  signal?: AbortSignal
): Promise<Result<LanyardRecords>> {
  const list = (collection: string) =>
    listRecords('lanyards', did, collection, { limit: LIST_LIMIT, signal });
  const [honorific, web, audio, video] = await Promise.all([
    getRecord('lanyards', did, LANYARDS_NSID.honorific, 'self', signal),
    list(LANYARDS_NSID.webLink),
    list(LANYARDS_NSID.audio),
    list(LANYARDS_NSID.video),
  ]);
  if (!honorific.ok) return honorific;
  if (!web.ok) return web;
  if (!audio.ok) return audio;
  if (!video.ok) return video;

  const honorificCheck = honorific.value
    ? validateRecord(LANYARDS_NSID.honorific, honorific.value.value)
    : null;
  const honorificValue =
    honorificCheck?.ok &&
    (honorificCheck.value as { value: string }).value !== 'none'
      ? (honorificCheck.value as { value: 'Dr' | 'Prof' }).value
      : undefined;

  const webLinks: WebLink[] = validRecords<WebRecord>(
    LANYARDS_NSID.webLink,
    web.value
  ).map(({ uri, value }) => ({
    key: uri,
    url: value.url,
    ...(value.title ? { title: value.title } : {}),
  }));

  return ok({
    ...(honorificValue ? { honorific: honorificValue } : {}),
    webLinks,
    media: [
      ...toMedia(
        'audio',
        validRecords<MediaRecord>(LANYARDS_NSID.audio, audio.value)
      ),
      ...toMedia(
        'video',
        validRecords<MediaRecord>(LANYARDS_NSID.video, video.value)
      ),
    ],
  });
}
