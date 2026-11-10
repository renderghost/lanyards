import type { BlockStatus } from '@/lib/person/blocks';
import type { BlockConfig } from '@/lib/person/config';

export type BlockEditorRowProps = {
  block: BlockConfig;
  /** The block's heading, e.g. "Links". */
  name: string;
  index: number;
  total: number;
  /** Present for visible blocks once their sources answer. */
  status?: BlockStatus;
  editLinks: { label: string; url: string }[];
  disabled: boolean;
  onMove(to: number): void;
  onToggle(visible: boolean): void;
  onLimit(limit: number): void;
  onRetry(): void;
  className?: string;
};
