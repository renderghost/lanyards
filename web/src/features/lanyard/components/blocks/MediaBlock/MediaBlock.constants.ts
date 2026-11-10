import { msg } from '@lingui/core/macro';

/** Labels for the kept media lexicons' platform and type enums. */
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
  lecture: msg`Lecture`,
  'panel-discussion': msg`Panel discussion`,
  presentation: msg`Presentation`,
  tutorial: msg`Tutorial`,
  'conference-talk': msg`Conference talk`,
  other: msg`Other`,
};
