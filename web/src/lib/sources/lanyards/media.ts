import { LANYARDS_NSID } from '@/lib/lexicons/nsids';

export type MediaKind = 'audio' | 'video';

export const MEDIA_KINDS: readonly MediaKind[] = ['audio', 'video'];

/**
 * The platforms and kinds of content the form offers for each kind, all
 * known to app.lanyards.media.item. Recordings of talks belong on Sifa
 * talks, so there are no talk types (#132).
 */
export const MEDIA_PLATFORMS: Record<MediaKind, readonly string[]> = {
  audio: ['spotify', 'apple-podcasts', 'soundcloud', 'anchor', 'other'],
  video: ['youtube', 'vimeo', 'twitch', 'tiktok', 'other'],
};

export const MEDIA_TYPES: Record<MediaKind, readonly string[]> = {
  audio: ['podcast-episode', 'interview', 'panel-discussion', 'other'],
  video: ['interview', 'tutorial', 'other'],
};

/** The collections media lives in: the one record type, and the legacy two. */
export type MediaCollection =
  | typeof LANYARDS_NSID.mediaItem
  | typeof LANYARDS_NSID.legacyAudio
  | typeof LANYARDS_NSID.legacyVideo;

const LEGACY_KINDS: Record<string, MediaKind> = {
  [LANYARDS_NSID.legacyAudio]: 'audio',
  [LANYARDS_NSID.legacyVideo]: 'video',
};

/** The talk types the legacy lexicons had; talks belong on Sifa now. */
const TALK_TYPES = new Set(['lecture', 'presentation', 'conference-talk']);

/** Legacy field names, and what app.lanyards.media.item calls them. */
const RENAMED: Record<string, string> = {
  publishedDate: 'publishedAt',
  relatedWork: 'related',
};

/** The collection an AT-URI's record lives in. */
export const collectionOf = (uri: string): MediaCollection =>
  (uri.split('/')[3] ?? '') as MediaCollection;

/** A legacy record's kind, from its AT-URI; undefined for a media item. */
export const legacyKindOf = (uri: string): MediaKind | undefined =>
  LEGACY_KINDS[collectionOf(uri)];

/**
 * Where a legacy record lives once moved: the media item with its rkey.
 * Null for any other key. A hidden legacy key still hides the item, so a
 * move cut short never shows what the owner hid (#132).
 */
export function movedKeyOf(uri: string): string | null {
  if (!legacyKindOf(uri)) return null;
  const [, , did, , rkey] = uri.split('/');
  return `at://${did}/${LANYARDS_NSID.mediaItem}/${rkey}`;
}

export const isMediaKind = (value: unknown): value is MediaKind =>
  value === 'audio' || value === 'video';

/**
 * A legacy app.lanyards.link.media.audio/.video record as the fields of
 * an app.lanyards.media.item, keeping every field it had (#132).
 */
export function itemFromLegacy(
  kind: MediaKind,
  legacy: Record<string, unknown>
): Record<string, unknown> {
  const { $type: _type, ...fields } = legacy;
  const item: Record<string, unknown> = { kind };
  for (const [name, value] of Object.entries(fields)) {
    item[RENAMED[name] ?? name] = value;
  }
  if (typeof item.type === 'string' && TALK_TYPES.has(item.type)) {
    item.type = 'other';
  }
  // The legacy lexicons allowed any integer; a length is never negative.
  const { duration } = item;
  if (
    duration !== undefined &&
    !(Number.isInteger(duration) && (duration as number) >= 0)
  ) {
    delete item.duration;
  }
  return item;
}
