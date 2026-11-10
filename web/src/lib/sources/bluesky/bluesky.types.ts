import type { AppBskyRichtextFacet } from '@atcute/bluesky';
import type { Did, Handle } from '@atcute/lexicons';

export type Facet = AppBskyRichtextFacet.Main;

export type ProfileLink = {
  /** AT-URI of the app.bsky.actor.link record. */
  key: string;
  url: string;
  title?: string;
  iconUrl?: string;
};

export type BlueskyProfile = {
  did: Did;
  handle: Handle;
  displayName?: string;
  description?: string;
  pronouns?: string;
  /** The small CDN variant of the avatar. */
  avatar?: string;
  links: ProfileLink[];
  /** Label values on the profile, e.g. '!no-unauthenticated'. */
  labels: string[];
};

export type BskyPost = {
  /** AT-URI of the post. */
  key: string;
  url: string;
  text: string;
  facets?: Facet[];
  createdAt: string;
};

export type Relationship = {
  /** AT-URI of the viewer's follow record, when they follow the subject. */
  followUri?: string;
  followedBy: boolean;
  /** A block in either direction, directly or through a list. */
  blocked: boolean;
};

export type KnownFollower = { did: Did; handle: Handle; displayName?: string };

export type KnownFollowers = {
  /** The first two people you follow who follow the subject. */
  sample: KnownFollower[];
  count: number;
  /** More exist than `count`. */
  more: boolean;
};
