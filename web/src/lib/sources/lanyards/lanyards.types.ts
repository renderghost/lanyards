export type WebLink = {
  /** AT-URI of the app.lanyards.link.web record. */
  key: string;
  url: string;
  title?: string;
};

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

export type LanyardRecords = {
  /** The raw, validated app.lanyards.actor.lanyard record, if any. */
  config: { value: unknown; cid: string } | null;
  honorific?: 'Dr' | 'Prof';
  webLinks: WebLink[];
  media: MediaLink[];
};
