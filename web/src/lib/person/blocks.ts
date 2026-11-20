import { cdnImage } from '@/lib/atproto/avatar';
import { normaliseDoi, normaliseUrl, safeHref } from '@/lib/normalise';
import type {
  BlueskyProfile,
  BskyPost,
} from '@/lib/sources/bluesky/bluesky.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { movedKeyOf } from '@/lib/sources/lanyards/media';
import type { OrcidWork } from '@/lib/sources/orcid/orcid.types';
import type { SourceName } from '@/lib/sources/result';
import type { SembleCollection } from '@/lib/sources/semble/semble.types';
import type { SifaProfile } from '@/lib/sources/sifa/sifa.types';
import type { BlogPost } from '@/lib/sources/standardSite/standardSite.types';
import type { CodeRepo } from '@/lib/sources/tangled/tangled.types';

import {
  type BlockConfig,
  DEFAULT_BLOCK_ORDER,
  COUNTED_BLOCKS,
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
  links: ['bluesky', 'sifa'],
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
      iconUrl: cdnImage(link.iconUrl),
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
    {
      url: string;
      titles: Candidate[];
      hint?: string;
      iconUrl?: string;
    }
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

/** An Open to item's key, which the owner can hide. */
export const openToKey = (value: string): string => `openTo:${value}`;

const BUILDERS: Builders = {
  links: (values) => mergeLinks(values),
  talks: (values) => values.sifa?.talks ?? [],
  openTo: (values) =>
    (values.sifa?.openTo ?? []).map((value) => ({
      key: openToKey(value),
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
/** Every form a hidden key matches: itself, its URL, and where it moved. */
function hiddenForms(value: string): string[] {
  return [value, normaliseUrl(value), movedKeyOf(value)].filter(
    (form): form is string => form !== null
  );
}

function hiddenSet(hidden: readonly string[]): Set<string> {
  return new Set(hidden.flatMap(hiddenForms));
}

/** Whether a key is among `hidden`, a link by any form of its URL. */
export function hiddenMatcher(
  hidden: readonly string[]
): (key: string) => boolean {
  const set = hiddenSet(hidden);
  return (key) => isHidden(key, set);
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

export type ComposeInput = {
  config: LanyardConfig;
  sources: SourceSnapshot;
  orcidVerified: boolean;
};

/** Why a hidden item can't be shown in the list of hidden items. */
export type HiddenItemReason =
  /** Its block is switched off, so its source wasn't read. */
  | 'off'
  | 'loading'
  /** Its block's source couldn't be read. */
  | 'failed'
  /** Its source was read and no longer has it. */
  | 'gone';

/**
 * A hidden key: with its block and item when a loaded source has it, or
 * else the block it belongs to (when the key says) and why it's missing.
 */
export type HiddenItem =
  | { key: string; type: RenderableBlockType; item: BlockItem }
  | { key: string; type?: RenderableBlockType; reason: HiddenItemReason };

/** The collection of each record that a block shows, by item key. */
const COLLECTION_BLOCKS: Record<string, RenderableBlockType> = {
  'app.bsky.feed.post': 'bskyPosts',
  'id.sifa.profile.presentation': 'talks',
  'id.sifa.profile.presentationDelivery': 'talks',
  'id.sifa.profile.publication': 'publications',
  'id.sifa.profile.skill': 'skills',
  'id.sifa.profile.education': 'education',
  'site.standard.document': 'blogPosts',
  'org.tangled.repo.manifest': 'code',
  'org.tangled.repo.declaration': 'code',
  'network.cosmik.collection': 'collections',
  'app.lanyards.media.item': 'media',
  'app.lanyards.link.media.audio': 'media',
  'app.lanyards.link.media.video': 'media',
};

/** The block an item key belongs to, read from the key itself. */
function blockOfKey(key: string): RenderableBlockType | undefined {
  if (key === 'details') return 'details';
  if (key.startsWith('orcid:')) return 'publications';
  if (key.startsWith('openTo:')) return 'openTo';
  if (key.startsWith('at://'))
    return COLLECTION_BLOCKS[key.split('/')[3] ?? ''];
  // Links are keyed by their normalised URL.
  if (/^https?:\/\//i.test(key)) return 'links';
  return undefined;
}

/** Sources read only once the Bluesky profile has given the handle. */
const NEEDS_HANDLE: ReadonlySet<SourceKey> = new Set(['tangled', 'semble']);

/** The owner's hidden items, for "Show again" (spec §7.4). */
export function hiddenItems(input: ComposeInput): HiddenItem[] {
  const results = new Map(
    DEFAULT_BLOCK_ORDER.map((type) => [
      type,
      gather(type, input.sources, input.orcidVerified),
    ])
  );
  // Every loaded item, by its key and its normalised URL, first in block
  // order winning: one pass, however long the hidden list.
  const index = new Map<
    string,
    { order: number; type: RenderableBlockType; item: BlockItem }
  >();
  let order = 0;
  for (const [type, result] of results) {
    if (result.loading) continue;
    for (const item of result.items) {
      const entry = { order: order++, type, item: item as BlockItem };
      for (const form of [item.key, normaliseUrl(item.key)]) {
        if (form !== null && !index.has(form)) index.set(form, entry);
      }
    }
  }
  return input.config.hidden.map((key): HiddenItem => {
    const match = hiddenForms(key)
      .map((form) => index.get(form))
      .filter((entry) => entry !== undefined)
      .sort((a, b) => a.order - b.order)[0];
    if (match) return { key, type: match.type, item: match.item };
    const type = blockOfKey(key);
    if (!type) return { key, reason: 'gone' };
    const visible = input.config.blocks.some(
      (block) => block.type === type && block.visible
    );
    const result = results.get(type);
    const profile = input.sources.bluesky?.status;
    // Until the profile gives the handle, these sources aren't read at all.
    const waitingOnProfile =
      BLOCK_SOURCES[type].some((source) => NEEDS_HANDLE.has(source)) &&
      profile !== 'ready';
    const reason: HiddenItemReason = !visible
      ? 'off'
      : waitingOnProfile
        ? profile === 'error'
          ? 'failed'
          : 'loading'
        : !result || result.loading
          ? 'loading'
          : result.failed.length > 0
            ? 'failed'
            : 'gone';
    return { key, type, reason };
  });
}

/** Hidden entries that no longer exist where they were read: "Clear". */
export function orphanedHiddenKeys(input: ComposeInput): string[] {
  return hiddenItems(input).flatMap((entry) =>
    'reason' in entry && entry.reason === 'gone' ? [entry.key] : []
  );
}

/** A block as the owner edits it on the lanyard (#118). */
export type EditorBlock = {
  type: RenderableBlockType;
  visible: boolean;
  /** For counted blocks only. */
  limit?: number;
  status: BlockStatus['status'];
  /** Every item it shows, with the hidden ones in their places. */
  items: { item: BlockItem; hidden: boolean }[];
  failedSources: SourceName[];
};

/**
 * Every block in the owner's order, switched-off ones included, with each
 * item it would show and the hidden ones flagged where they'd be. Counted
 * blocks stop at their count of shown items.
 */
export function composeEditorBlocks(input: ComposeInput): EditorBlock[] {
  const hidden = hiddenSet(input.config.hidden);
  return input.config.blocks.map((block): EditorBlock => {
    const limit = itemLimit(block);
    const shape = {
      type: block.type,
      visible: block.visible,
      ...(COUNTED_BLOCKS.has(block.type) ? { limit } : {}),
    };
    const gathered = gather(block.type, input.sources, input.orcidVerified);
    if (gathered.loading) {
      return { ...shape, status: 'loading', items: [], failedSources: [] };
    }
    const items: EditorBlock['items'] = [];
    let shown = 0;
    for (const item of gathered.items) {
      if (shown >= limit) break;
      const isItemHidden = isHidden(item.key, hidden);
      items.push({ item: item as BlockItem, hidden: isItemHidden });
      if (!isItemHidden) shown += 1;
    }
    const status: EditorBlock['status'] =
      items.length > 0
        ? 'ready'
        : gathered.failed.length > 0
          ? 'error'
          : 'empty';
    return { ...shape, status, items, failedSources: gathered.failed };
  });
}
