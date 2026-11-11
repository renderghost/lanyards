import type { RenderableBlockType } from '@/lib/person/config';
import type { BlockView } from '@/lib/person/personView.types';

export type LanyardBlocksProps = {
  blocks: BlockView[];
  owner: boolean;
  /**
   * The owner's handle, or DID when it doesn't verify (see profileId), for
   * links to edit their data on Sifa or Bluesky.
   */
  profile?: string;
  /** Fetches a block's sources again; settles once they have answered. */
  onRetry(type: RenderableBlockType): Promise<unknown> | void;
  className?: string;
};
