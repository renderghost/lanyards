import type { EditorBlock } from '@/lib/person/blocks';

export type EditableBlockProps = {
  block: EditorBlock;
  index: number;
  total: number;
  /** The owner's handle (or DID), for "Edit on Sifa / in Bluesky". */
  profile: string;
  disabled: boolean;
  onMove(to: number): void;
  onVisibleChange(visible: boolean): void;
  onLimitChange(limit: number): void;
  /** Fetches the block's sources again. */
  onRetry(): Promise<unknown> | void;
};
