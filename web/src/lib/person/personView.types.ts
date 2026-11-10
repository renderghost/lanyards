import type { Did, Handle } from '@atcute/lexicons';

import type {
  BlueskyProfile,
  BskyPost,
} from '@/lib/sources/bluesky/bluesky.types';
import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';
import type { SourceError, SourceName } from '@/lib/sources/result';
import type { SembleCollection } from '@/lib/sources/semble/semble.types';
import type {
  OpenToValue,
  SifaEducation,
  SifaSkill,
  SifaTalk,
} from '@/lib/sources/sifa/sifa.types';
import type { BlogPost } from '@/lib/sources/standardSite/standardSite.types';
import type { CodeRepo } from '@/lib/sources/tangled/tangled.types';

import type { LanyardConfig, RenderableBlockType } from './config';
import type { Platform } from './platform';

/** Every query a lanyard can make: one per source, plus two extra reads. */
export type SourceKey = SourceName | 'blueskyPosts' | 'orcidWorks';

export type SourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: SourceError }
  | { status: 'ready'; value: T };

export type SourceSnapshot = Partial<Record<SourceKey, SourceState<unknown>>>;

export type BadgeHero = {
  did: Did;
  handle: Handle;
  displayName: string;
  honorific?: 'Dr' | 'Prof';
  avatar?: string;
  pronouns?: string;
  headline?: string;
  job?: { title: string; company?: string };
};

export type LinkItem = {
  /** The normalised URL. */
  key: string;
  url: string;
  title: string;
  platform: Platform;
  iconUrl?: string;
};

export type PublicationItem = {
  key: string;
  title: string;
  url?: string;
  doi?: string;
  year?: string;
  venue?: string;
  /** Backed by an ORCID record that links back to this person. */
  orcidVerified: boolean;
};

export type OpenToItem = { key: string; value: OpenToValue };

export type DetailsItem = {
  key: 'details';
  location?: string;
  /** BCP 47 language codes. */
  languages: string[];
};

/** The item type each block shows. Every item's `key` can be hidden. */
export type BlockItems = {
  links: LinkItem;
  talks: SifaTalk;
  openTo: OpenToItem;
  blogPosts: BlogPost;
  bskyPosts: BskyPost;
  publications: PublicationItem;
  skills: SifaSkill;
  education: SifaEducation;
  code: CodeRepo;
  collections: SembleCollection;
  media: MediaLink;
  details: DetailsItem;
};

export type BlockItem = BlockItems[RenderableBlockType];

export type BlockView = {
  [T in RenderableBlockType]: { type: T } & (
    | { status: 'loading' }
    | { status: 'error'; sources: SourceName[] }
    | { status: 'ready'; items: BlockItems[T][]; failedSources: SourceName[] }
  );
}[RenderableBlockType];

export type ViewerMode = 'owner' | 'visitor';

export type PersonViewState = {
  profile: SourceState<BlueskyProfile>;
  hero?: BadgeHero;
  blocks: BlockView[];
  config: LanyardConfig;
  /** The owner's config has loaded (or is known to be absent). */
  configReady: boolean;
  mode: ViewerMode;
  retry(source: SourceKey): void;
};
