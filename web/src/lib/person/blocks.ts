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
  DEFAULT_BLOCK_ORDER,
  itemLimit,
  type LanyardConfig,
  type RenderableBlockType,
} from './config';
import type {
  BlockItem,
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

type Gathered =
  | { loading: true }
  | { loading: false; items: { key: string }[]; failed: SourceName[] };

/** Every item a block's sources offer, before hiding and limits. */
function gather(
  type: RenderableBlockType,
  sources: SourceSnapshot,
  orcidVerified: boolean
): Gathered {
  const states = BLOCK_SOURCES[type].flatMap((key) => {
    const state = sources[key];
    return state ? [{ key, state }] : [];
  });
  if (states.some(({ state }) => state.status === 'loading')) {
    return { loading: true };
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
  const items = BUILDERS[type](values, orcidVerified) as { key: string }[];
  return { loading: false, items, failed };
}

/** Hidden keys, with each URL also in its normalised form. */
function hiddenSet(hidden: readonly string[]): Set<string> {
  return new Set(
    hidden.flatMap((value) => {
      const url = normaliseUrl(value);
      return url ? [value, url] : [value];
    })
  );
}

function composeBlock(
  block: BlockConfig,
  sources: SourceSnapshot,
  mode: ViewerMode,
  orcidVerified: boolean,
  hidden: Set<string>
): BlockView | null {
  const gathered = gather(block.type, sources, orcidVerified);
  if (gathered.loading) {
    return { type: block.type, status: 'loading' } as BlockView;
  }
  const { failed } = gathered;
  const items = gathered.items
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
  const hidden = hiddenSet(input.config.hidden);
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

/** What a visible block has to show, for the owner's customiser. */
export type BlockStatus =
  | { status: 'loading' }
  | { status: 'error'; sources: SourceName[] }
  | { status: 'empty' }
  | { status: 'ready'; count: number; failedSources: SourceName[] };

type ComposeInput = {
  config: LanyardConfig;
  sources: SourceSnapshot;
  orcidVerified: boolean;
};

/**
 * Each visible block's status, including the empty ones the lanyard leaves
 * out, so the customiser can say "Nothing to show yet" (spec §7.2).
 */
export function blockStatuses(
  input: ComposeInput
): Partial<Record<RenderableBlockType, BlockStatus>> {
  const hidden = hiddenSet(input.config.hidden);
  const statuses: Partial<Record<RenderableBlockType, BlockStatus>> = {};
  for (const block of input.config.blocks) {
    if (!block.visible) continue;
    const gathered = gather(block.type, input.sources, input.orcidVerified);
    if (gathered.loading) {
      statuses[block.type] = { status: 'loading' };
      continue;
    }
    const count = gathered.items.filter(
      (item) => !isHidden(item.key, hidden)
    ).length;
    statuses[block.type] =
      count > 0
        ? { status: 'ready', count, failedSources: gathered.failed }
        : gathered.failed.length
          ? { status: 'error', sources: gathered.failed }
          : { status: 'empty' };
  }
  return statuses;
}

/** A hidden key, with its block and item when a loaded source has it. */
export type HiddenItem =
  { key: string } | { key: string; type: RenderableBlockType; item: BlockItem };

/** The owner's hidden items, for "Show again" (spec §7.4). */
export function hiddenItems(input: ComposeInput): HiddenItem[] {
  const gathered = DEFAULT_BLOCK_ORDER.flatMap((type) => {
    const result = gather(type, input.sources, input.orcidVerified);
    return result.loading ? [] : [{ type, items: result.items }];
  });
  return input.config.hidden.map((key) => {
    const wanted = hiddenSet([key]);
    for (const { type, items } of gathered) {
      const item = items.find((candidate) => isHidden(candidate.key, wanted));
      if (item) return { key, type, item: item as BlockItem };
    }
    return { key };
  });
}
