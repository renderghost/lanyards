import { ACCENTS, type Accent, DEFAULT_ACCENT } from '@/design/accents';
import { LANYARDS_NSID, type BlockType } from '@/lib/lexicons/nsids';
import { validateRecord } from '@/lib/lexicons/validate';
import { tooLong } from '@/lib/validation';

/** `events` needs the calendar adapter (Slice 2), so it never renders yet. */
export type RenderableBlockType = Exclude<BlockType, 'events'>;

export const DEFAULT_BLOCK_ORDER: readonly RenderableBlockType[] = [
  'links',
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

/** Smart defaults (spec §7.2): links and talks on, everything else opt-in. */
export const DEFAULT_VISIBLE: ReadonlySet<RenderableBlockType> = new Set([
  'links',
  'talks',
]);

export const DEFAULT_ITEM_LIMIT = 3;
export const MAX_LINKS = 20;

const CONFIG_FIELDS = ['accent', 'showJob', 'blocks', 'hidden'] as const;

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
  showJob: boolean;
  blocks: BlockConfig[];
  /** AT-URIs and URLs of items the owner hid. */
  hidden: string[];
};

type StoredBlock = { type: string; visible: boolean; limit?: number };
type StoredConfig = {
  accent?: string;
  showJob?: boolean;
  blocks?: StoredBlock[];
  hidden?: string[];
};

const isRenderable = (type: string): type is RenderableBlockType =>
  (DEFAULT_BLOCK_ORDER as readonly string[]).includes(type);

const isAccent = (value: string | undefined): value is Accent =>
  (ACCENTS as readonly string[]).includes(value ?? '');

/**
 * The owner's lanyard settings, or the smart defaults when there is no
 * valid app.lanyards.actor.lanyard record. Unknown and duplicate block types
 * are ignored; renderable blocks the record doesn't mention are appended in
 * default order with their default visibility.
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
  for (const type of DEFAULT_BLOCK_ORDER) {
    if (!seen.has(type)) {
      blocks.push({ type, visible: DEFAULT_VISIBLE.has(type) });
    }
  }

  return {
    accent: isAccent(stored.accent) ? stored.accent : DEFAULT_ACCENT,
    showJob: stored.showJob ?? true,
    blocks,
    hidden: stored.hidden ?? [],
  };
}

/** How many items a block shows: 3 by default, all links up to 20. */
export function itemLimit(block: BlockConfig): number {
  if (block.type === 'links') {
    return Math.min(block.limit ?? MAX_LINKS, MAX_LINKS);
  }
  return block.limit ?? DEFAULT_ITEM_LIMIT;
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
  const { $type: _type, ...kept } =
    previous && typeof previous === 'object' ? (previous as StoredFields) : {};
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
    showJob: config.showJob,
    blocks,
    hidden: config.hidden,
    createdAt: typeof kept.createdAt === 'string' ? kept.createdAt : now,
    updatedAt: now,
  };
}
