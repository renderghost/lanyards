/** NSIDs of the lexicons Lanyards publishes from lanyards.app. */
export const LANYARDS_NSID = {
  lanyard: 'app.lanyards.actor.lanyard',
  honorific: 'app.lanyards.actor.biography.honorific',
  webLink: 'app.lanyards.link.web',
  audio: 'app.lanyards.link.media.audio',
  video: 'app.lanyards.link.media.video',
  authFull: 'app.lanyards.authFull',
} as const;

/** The record collections the app.lanyards.authFull permission set covers. */
export const AUTH_FULL_COLLECTIONS = [
  LANYARDS_NSID.lanyard,
  LANYARDS_NSID.honorific,
  LANYARDS_NSID.webLink,
  LANYARDS_NSID.audio,
  LANYARDS_NSID.video,
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
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];
