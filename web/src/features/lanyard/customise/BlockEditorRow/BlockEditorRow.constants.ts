import { MAX_LINKS, type RenderableBlockType } from '@/lib/person/config';

/** "Items to show" offers 1 to 20, the most a block can show. */
export const LIMIT_OPTIONS = Array.from(
  { length: MAX_LINKS },
  (_, index) => index + 1
);

/** Blocks that only ever show one item, so have no "Items to show". */
export const SINGLE_ITEM_BLOCKS: ReadonlySet<RenderableBlockType> = new Set([
  'details',
]);
