export type MediaLink = {
  /** AT-URI of the app.lanyards.link.media.audio/.video record. */
  key: string;
  kind: 'audio' | 'video';
  url: string;
  platform: string;
  title?: string;
  description?: string;
  type?: string;
  publishedDate?: string;
};

/**
 * The raw app.lanyards.actor.lanyard record. `valid` is false when it
 * exists but fails its lexicon: readers use defaults, and the customiser
 * won't edit it (it offers a reset instead).
 */
export type LanyardConfigRecord = {
  value: unknown;
  cid: string;
  valid: boolean;
};

/** The owner's records Lanyards keeps itself: podcasts and videos. */
export type LanyardRecords = {
  media: MediaLink[];
};
