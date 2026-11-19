import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';

import type { RenderableBlockType } from '@/lib/person/config';

/** dnd-kit's handle wiring, from the sortable block around the bar. */
export type DragHandle = {
  ref(element: HTMLElement | null): void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

export type BlockBarProps = {
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
  dragHandle?: DragHandle;
};
