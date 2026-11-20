export type MediaLink = {
  /**
   * AT-URI of the app.lanyards.media.item record, or of a legacy
   * app.lanyards.link.media.audio/.video record until it moves (#132).
   */
  key: string;
  kind: 'audio' | 'video';
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  type?: string;
  publishedAt?: string;
  /** Read from a legacy collection: moved on the owner's next visit. */
  legacy?: true;
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
