import { normaliseDoi, normaliseUrl, safeHref } from '@/lib/normalise';
import type {
  BlueskyProfile,
  BskyPost,
} from '@/lib/sources/bluesky/bluesky.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import type { OrcidWork } from '@/lib/sources/orcid/orcid.types';
import type { SourceName } from '@/lib/sources/result';
import type { SembleCollection } from '@/lib/sources/semble/semble.types';
import type { SifaProfile } from '@/lib/sources/sifa/sifa.types';
import type { BlogPost } from '@/lib/sources/standardSite/standardSite.types';
import type { CodeRepo } from '@/lib/sources/tangled/tangled.types';

import {
  type BlockConfig,
  itemLimit,
  type LanyardConfig,
  type RenderableBlockType,
} from './config';
import type {
  BlockItems,
  BlockView,
  LinkItem,
  PublicationItem,
  SourceKey,
  SourceSnapshot,
  ViewerMode,
} from './personView.types';
import { detectPlatform } from './platform';

/** Which queries feed each block. */
export const BLOCK_SOURCES: Record<RenderableBlockType, SourceKey[]> = {
  links: ['bluesky', 'sifa', 'lanyards'],
  talks: ['sifa'],
  openTo: ['sifa'],
  blogPosts: ['standardSite'],
  bskyPosts: ['blueskyPosts'],
  publications: ['orcidWorks', 'sifa'],
  skills: ['sifa'],
  education: ['sifa'],
  code: ['tangled'],
  collections: ['semble'],
  media: ['lanyards'],
  details: ['sifa'],
};

const SOURCE_NAME: Record<SourceKey, SourceName> = {
  bluesky: 'bluesky',
  blueskyPosts: 'bluesky',
  sifa: 'sifa',
  standardSite: 'standardSite',
  orcid: 'orcid',
  orcidWorks: 'orcid',
  tangled: 'tangled',
  semble: 'semble',
  lanyards: 'lanyards',
};

type Values = {
  bluesky?: BlueskyProfile;
  blueskyPosts?: BskyPost[];
  sifa?: SifaProfile | null;
  standardSite?: BlogPost[];
  orcidWorks?: OrcidWork[];
  tangled?: CodeRepo[];
  semble?: SembleCollection[];
  lanyards?: LanyardRecords;
};

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** Bluesky links (owner-ordered), then Lanyards links, then Sifa accounts. */
function mergeLinks(values: Values): LinkItem[] {
  type Candidate = {
    url: string;
    title?: string;
    rank: number;
    hint?: string;
    iconUrl?: string;
  };
  const candidates: Candidate[] = [
    ...(values.bluesky?.links ?? []).map((link) => ({
      url: link.url,
      title: link.title,
      rank: 1,
      iconUrl: link.iconUrl,
    })),
    ...(values.lanyards?.webLinks ?? []).map((link) => ({
      url: link.url,
      title: link.title,
      rank: 0,
    })),
    ...(values.sifa?.externalAccounts ?? []).map((account) => ({
      url: account.url,
      title: account.label,
      rank: 2,
      hint: account.platform,
    })),
  ];

  const merged = new Map<
    string,
    { url: string; titles: Candidate[]; hint?: string; iconUrl?: string }
  >();
  for (const candidate of candidates) {
    const key = normaliseUrl(candidate.url);
    if (!key || !safeHref(candidate.url)) continue;
    const entry = merged.get(key) ?? { url: candidate.url, titles: [] };
    entry.titles.push(candidate);
    entry.hint ??= candidate.hint;
    entry.iconUrl ??= candidate.iconUrl;
    merged.set(key, entry);
  }

  return [...merged].map(([key, entry]) => {
    const titled = entry.titles
      .filter((candidate) => candidate.title)
      .sort((a, b) => a.rank - b.rank)[0];
    return {
      key,
      url: entry.url,
      title: titled?.title ?? hostOf(entry.url),
      platform: detectPlatform(entry.url, entry.hint),
      ...(entry.iconUrl ? { iconUrl: entry.iconUrl } : {}),
    };
  });
}

/** ORCID works and Sifa publications, one per DOI, newest first. */
function mergePublications(
  values: Values,
  orcidVerified: boolean
): PublicationItem[] {
  const byDoi = new Map<string, PublicationItem>();
  const items: PublicationItem[] = [];

  for (const work of values.orcidWorks ?? []) {
    const item: PublicationItem = {
      key: work.key,
      title: work.title,
      ...(work.doi ? { doi: work.doi } : {}),
      ...(work.year ? { year: work.year } : {}),
      ...(work.url ? { url: work.url } : {}),
      ...(work.venue ? { venue: work.venue } : {}),
      orcidVerified,
    };
    items.push(item);
    if (work.doi) byDoi.set(work.doi, item);
  }

  for (const publication of values.sifa?.publications ?? []) {
    const doi = publication.doi ? normaliseDoi(publication.doi) : null;
    const url = publication.url ? safeHref(publication.url) : undefined;
    const year = publication.date?.slice(0, 4);
    const match = doi ? byDoi.get(doi) : undefined;
    if (match) {
      match.url ??= url;
      match.venue ??= publication.venue;
      match.year ??= year;
      continue;
    }
    items.push({
      key: publication.key,
      title: publication.title,
      ...(doi ? { doi } : {}),
      ...(year ? { year } : {}),
      ...(url ? { url } : {}),
      ...(publication.venue ? { venue: publication.venue } : {}),
      orcidVerified: false,
    });
  }

  return items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        (b.item.year ?? '').localeCompare(a.item.year ?? '') ||
        a.index - b.index
    )
    .map(({ item }) => item);
}

type Builders = {
  [T in RenderableBlockType]: (
    values: Values,
    orcidVerified: boolean
  ) => BlockItems[T][];
};

const BUILDERS: Builders = {
  links: (values) => mergeLinks(values),
  talks: (values) => values.sifa?.talks ?? [],
  openTo: (values) =>
    (values.sifa?.openTo ?? []).map((value) => ({
      key: `openTo:${value}`,
      value,
    })),
  blogPosts: (values) => values.standardSite ?? [],
  bskyPosts: (values) => values.blueskyPosts ?? [],
  publications: (values, verified) => mergePublications(values, verified),
  skills: (values) => values.sifa?.skills ?? [],
  education: (values) => values.sifa?.education ?? [],
  code: (values) => values.tangled ?? [],
  collections: (values) => values.semble ?? [],
  media: (values) => values.lanyards?.media ?? [],
  details: (values) => {
    const sifa = values.sifa;
    if (!sifa || (!sifa.location && sifa.langs.length === 0)) return [];
    return [
      {
        key: 'details',
        ...(sifa.location ? { location: sifa.location } : {}),
        languages: sifa.langs,
      },
    ];
  },
};

function isHidden(key: string, hidden: Set<string>): boolean {
  if (hidden.has(key)) return true;
  const url = normaliseUrl(key);
  return url !== null && hidden.has(url);
}

function composeBlock(
  block: BlockConfig,
  sources: SourceSnapshot,
  mode: ViewerMode,
  orcidVerified: boolean,
  hidden: Set<string>
): BlockView | null {
  const states = BLOCK_SOURCES[block.type].flatMap((key) => {
    const state = sources[key];
    return state ? [{ key, state }] : [];
  });
  if (states.some(({ state }) => state.status === 'loading')) {
    return { type: block.type, status: 'loading' } as BlockView;
  }

  const failed = [
    ...new Set(
      states
        .filter(({ state }) => state.status === 'error')
        .map(({ key }) => SOURCE_NAME[key])
    ),
  ];
  const values: Values = Object.fromEntries(
    states.flatMap(({ key, state }) =>
      state.status === 'ready' ? [[key, state.value]] : []
    )
  );

  const items = (
    BUILDERS[block.type](values, orcidVerified) as { key: string }[]
  )
    .filter((item) => !isHidden(item.key, hidden))
    .slice(0, itemLimit(block));

  if (items.length === 0) {
    // An owner learns about a failure that left the block empty.
    return mode === 'owner' && failed.length
      ? ({ type: block.type, status: 'error', sources: failed } as BlockView)
      : null;
  }
  return {
    type: block.type,
    status: 'ready',
    items,
    failedSources: failed,
  } as BlockView;
}

/**
 * The owner's visible blocks, in their order, built from whatever sources
 * have answered. Empty blocks never render; failed blocks show only to the
 * owner (spec §7.2, §13).
 */
export function composeBlocks(input: {
  config: LanyardConfig;
  sources: SourceSnapshot;
  mode: ViewerMode;
  orcidVerified: boolean;
}): BlockView[] {
  const hidden = new Set(
    input.config.hidden.flatMap((value) => {
      const url = normaliseUrl(value);
      return url ? [value, url] : [value];
    })
  );
  return input.config.blocks
    .filter((block) => block.visible)
    .flatMap((block) => {
      const view = composeBlock(
        block,
        input.sources,
        input.mode,
        input.orcidVerified,
        hidden
      );
      return view ? [view] : [];
    });
}
