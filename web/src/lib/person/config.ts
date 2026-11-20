import { type Accent, resolveAccent } from '@/design/accents';
import { type CoverPattern, isCover } from '@/design/covers';
import { LANYARDS_NSID, type BlockType } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';
import { tooLong } from '@/lib/validation';

/** `events` needs the calendar adapter (Slice 2), so it never renders yet. */
export type RenderableBlockType = Exclude<BlockType, 'events'>;

export const DEFAULT_BLOCK_ORDER: readonly RenderableBlockType[] = [
  'links',
  'roles',
  'talks',
  'openTo',
  'blogPosts',
  'bskyPosts',
  'publications',
  'skills',
  'education',
  'code',
  'collections',
  'media',
  'details',
];

/**
 * Smart defaults (spec §7.2): links, roles (#130) and talks on, everything
 * else opt-in.
 */
export const DEFAULT_VISIBLE: ReadonlySet<RenderableBlockType> = new Set([
  'links',
  'roles',
  'talks',
]);

export const DEFAULT_ITEM_LIMIT = 3;

const CONFIG_FIELDS = [
  'accent',
  'cover',
  'showRole',
  'showLocation',
  'showOpenTo',
  'blocks',
  'hidden',
] as const;

/**
 * A three-way merge of the customiser's settings, for when another device
 * saved since `base` was read: each field this side changed from `base`
 * takes this side's value, and every other field keeps `theirs`.
 */
export function mergeConfig(
  base: LanyardConfig,
  ours: LanyardConfig,
  theirs: LanyardConfig
): LanyardConfig {
  const merged = { ...theirs };
  for (const field of CONFIG_FIELDS) {
    if (JSON.stringify(ours[field]) !== JSON.stringify(base[field])) {
      Object.assign(merged, { [field]: ours[field] });
    }
  }
  return merged;
}

/** The lexicon's limits on hidden items: how many, and each key's bytes. */
export const MAX_HIDDEN = 500;
const MAX_HIDDEN_KEY_BYTES = 2048;

export type HideProblem = 'tooMany' | 'tooLong';

/**
 * Why `key` can't join the hidden items, or null when it can. A record
 * past the lexicon's limits would fail every later save.
 */
export function hideProblem(
  config: Pick<LanyardConfig, 'hidden'>,
  key: string
): HideProblem | null {
  if (config.hidden.includes(key)) return null;
  if (tooLong(key, MAX_HIDDEN_KEY_BYTES)) return 'tooLong';
  if (config.hidden.length >= MAX_HIDDEN) return 'tooMany';
  return null;
}

export type BlockConfig = {
  type: RenderableBlockType;
  visible: boolean;
  limit?: number;
};

export type LanyardConfig = {
  accent: Accent;
  /** The badge's cover; null until the owner picks one (#129). */
  cover: CoverPattern | null;
  /** What the badge's departure board shows. */
  showRole: boolean;
  showLocation: boolean;
  showOpenTo: boolean;
  blocks: BlockConfig[];
  /** AT-URIs and URLs of items the owner hid. */
  hidden: string[];
};

type StoredBlock = { type: string; visible: boolean; limit?: number };
type StoredBadge = {
  cover?: string;
  showRole?: boolean;
  showLocation?: boolean;
  showOpenTo?: boolean;
};
type StoredConfig = {
  accent?: string;
  /** Legacy: read as badge.showRole when that is absent. */
  showJob?: boolean;
  badge?: StoredBadge;
  blocks?: StoredBlock[];
  hidden?: string[];
};

const isRenderable = (type: string): type is RenderableBlockType =>
  (DEFAULT_BLOCK_ORDER as readonly string[]).includes(type);

/**
 * The owner's lanyard settings, or the smart defaults when there is no
 * valid app.lanyards.actor.lanyard record. Unknown and duplicate block types
 * are ignored. A renderable block the record doesn't mention (Roles, on a
 * lanyard saved before it, #130) goes in with its default visibility,
 * after the nearest block before it in the default order, or first.
 */
export function resolveConfig(record: unknown | null): LanyardConfig {
  const valid = record ? validateRecord(LANYARDS_NSID.lanyard, record) : null;
  const stored: StoredConfig = valid?.ok ? (valid.value as StoredConfig) : {};

  const seen = new Set<RenderableBlockType>();
  const blocks: BlockConfig[] = [];
  for (const block of stored.blocks ?? []) {
    if (!isRenderable(block.type) || seen.has(block.type)) continue;
    seen.add(block.type);
    blocks.push({
      type: block.type,
      visible: block.visible,
      ...(block.limit ? { limit: block.limit } : {}),
    });
  }
  DEFAULT_BLOCK_ORDER.forEach((type, index) => {
    if (seen.has(type)) return;
    const before = DEFAULT_BLOCK_ORDER.slice(0, index).findLast((earlier) =>
      seen.has(earlier)
    );
    const at = before
      ? blocks.findIndex((block) => block.type === before) + 1
      : 0;
    blocks.splice(at, 0, { type, visible: DEFAULT_VISIBLE.has(type) });
    seen.add(type);
  });

  return {
    // A legacy accent reads as the nearest of the four (#128).
    accent: resolveAccent(stored.accent),
    cover: isCover(stored.badge?.cover) ? stored.badge.cover : null,
    showRole: stored.badge?.showRole ?? stored.showJob ?? true,
    showLocation: stored.badge?.showLocation ?? true,
    showOpenTo: stored.badge?.showOpenTo ?? true,
    blocks,
    hidden: stored.hidden ?? [],
  };
}

/**
 * Blocks that keep a "Show N" count (#118): the feeds, which can run long
 * and don't come from Sifa, and Publications, which pulls every ORCID work.
 */
export const COUNTED_BLOCKS: ReadonlySet<RenderableBlockType> = new Set([
  'bskyPosts',
  'blogPosts',
  'code',
  'collections',
  'publications',
]);

/**
 * How many items a block shows: a counted block its count (3 by default);
 * every other block all that aren't hidden, whatever limit was stored.
 */
export function itemLimit(block: BlockConfig): number {
  return COUNTED_BLOCKS.has(block.type)
    ? (block.limit ?? DEFAULT_ITEM_LIMIT)
    : Infinity;
}

type StoredFields = Record<string, unknown>;

const isStoredBlock = (value: unknown): value is StoredBlock =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as StoredBlock).type === 'string';

/**
 * The app.lanyards.actor.lanyard fields for `config`, ready for putRecord.
 * Everything this slice doesn't edit is kept from `previous`: createdAt,
 * connect preferences, per-event overrides, unknown future fields, and
 * block entries of types it doesn't render (such as `events`), at their
 * positions. `updatedAt` is set to `now`; `createdAt` too on first save.
 */
export function serialiseConfig(
  config: LanyardConfig,
  previous: unknown | null,
  now: string
): StoredFields {
  // The badge settings replace the legacy showJob (#129).
  const {
    $type: _type,
    showJob: _showJob,
    ...kept
  } = previous && typeof previous === 'object'
    ? (previous as StoredFields)
    : {};
  const keptBadge =
    kept.badge && typeof kept.badge === 'object'
      ? (kept.badge as StoredFields)
      : {};
  const previousBlocks = Array.isArray(kept.blocks) ? kept.blocks : [];

  const blocks: StoredBlock[] = config.blocks.map((block) => ({
    type: block.type,
    visible: block.visible,
    ...(block.limit ? { limit: block.limit } : {}),
  }));
  previousBlocks.forEach((block: unknown, index: number) => {
    if (isStoredBlock(block) && !isRenderable(block.type)) {
      blocks.splice(Math.min(index, blocks.length), 0, block);
    }
  });

  return {
    ...kept,
    accent: config.accent,
    badge: {
      ...keptBadge,
      ...(config.cover ? { cover: config.cover } : {}),
      showRole: config.showRole,
      showLocation: config.showLocation,
      showOpenTo: config.showOpenTo,
    },
    blocks,
    hidden: config.hidden,
    createdAt: typeof kept.createdAt === 'string' ? kept.createdAt : now,
    updatedAt: now,
  };
}
