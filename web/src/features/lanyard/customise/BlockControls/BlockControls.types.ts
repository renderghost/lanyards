import type { RenderableBlockType } from '@/lib/person/config';

export type BlockControlsProps = {
  type: RenderableBlockType;
  index: number;
  total: number;
  visible: boolean;
  /** For counted blocks only. */
  limit?: number;
  disabled: boolean;
  onMove(to: number): void;
  onVisibleChange(visible: boolean): void;
  onLimitChange?(limit: number): void;
};
