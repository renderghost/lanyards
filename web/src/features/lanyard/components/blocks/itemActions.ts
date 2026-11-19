import { createContext, type ReactNode } from 'react';

/** What the customiser adds to each item in the owner's editor (#118). */
export type ItemActions = {
  /** The item is hidden from visitors (it stays in place, faded). */
  isHidden(itemKey: string): boolean;
  /** The item's show/hide control. */
  renderToggle(itemKey: string, title: string): ReactNode;
};

/**
 * Set only by the customiser, so the public lanyard never loads its
 * controls (they live in the lazy /lanyard chunk).
 */
export const ItemActionsContext = createContext<ItemActions | null>(null);
