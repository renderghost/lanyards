import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';

import type { RenderableBlockType } from '@/lib/person/config';

/** dnd-kit's handle wiring, from the sortable block around the handle. */
export type DragHandle = {
  ref(element: HTMLElement | null): void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

export type BlockHandleProps = {
  type: RenderableBlockType;
  disabled: boolean;
  dragHandle?: DragHandle;
};
