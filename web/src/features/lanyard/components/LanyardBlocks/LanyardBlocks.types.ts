import type { RenderableBlockType } from '@/lib/person/config';
import type { BlockView } from '@/lib/person/personView.types';

export type LanyardBlocksProps = {
  blocks: BlockView[];
  owner: boolean;
  onRetry(type: RenderableBlockType): void;
  className?: string;
};
