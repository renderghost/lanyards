import { msg } from '@lingui/core/macro';

/** Labels for app.lanyards.media.item's platforms and kinds of content. */
export const PLATFORM_LABELS: Record<string, ReturnType<typeof msg>> = {
  spotify: msg`Spotify`,
  'apple-podcasts': msg`Apple Podcasts`,
  soundcloud: msg`SoundCloud`,
  anchor: msg`Anchor`,
  youtube: msg`YouTube`,
  vimeo: msg`Vimeo`,
  twitch: msg`Twitch`,
  tiktok: msg`TikTok`,
  other: msg`Other`,
};

export const TYPE_LABELS: Record<string, ReturnType<typeof msg>> = {
  'podcast-episode': msg`Podcast episode`,
  interview: msg`Interview`,
  'panel-discussion': msg`Panel discussion`,
  tutorial: msg`Tutorial`,
  other: msg`Other`,
};
