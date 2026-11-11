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
  onRetry(type: RenderableBlockType): void;
  className?: string;
};
