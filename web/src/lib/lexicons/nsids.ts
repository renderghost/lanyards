/** NSIDs of the lexicons Lanyards publishes from lanyards.app. */
export const LANYARDS_NSID = {
  lanyard: 'app.lanyards.actor.lanyard',
  mediaItem: 'app.lanyards.media.item',
  /** Read, and moved to mediaItem, until the legacy app goes (#103). */
  legacyAudio: 'app.lanyards.link.media.audio',
  legacyVideo: 'app.lanyards.link.media.video',
  authFull: 'app.lanyards.authFull',
} as const;

/**
 * The record collections the app.lanyards.authFull permission set covers:
 * the legacy media collections stay so moved records can be deleted.
 */
export const AUTH_FULL_COLLECTIONS = [
  LANYARDS_NSID.lanyard,
  LANYARDS_NSID.mediaItem,
  LANYARDS_NSID.legacyAudio,
  LANYARDS_NSID.legacyVideo,
] as const;

/** Every block a lanyard can show, as stored in app.lanyards.actor.lanyard. */
export const BLOCK_TYPES = [
  'links',
  'talks',
  'openTo',
  'blogPosts',
  'bskyPosts',
  'publications',
  'skills',
  'education',
  'code',
  'collections',
  'media',
  'events',
  'details',
  // In the lexicon's order; the page's order is DEFAULT_BLOCK_ORDER.
  'roles',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

/** UserInput's records, for feedback to our board there (#134). */
export const USERINPUT_NSID = {
  discussion: 'app.userinput.discussion',
  space: 'app.userinput.space',
} as const;
