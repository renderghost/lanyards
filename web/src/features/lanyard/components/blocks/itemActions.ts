import { createContext, type ReactNode } from 'react';

/** What the customiser adds to each item in the owner's preview. */
export type ItemActions = {
  renderMenu(itemKey: string, title: string): ReactNode;
};

/**
 * Set only by the customiser's owner preview, so the public lanyard never
 * loads the item menu (it lives in the lazy /lanyard chunk).
 */
export const ItemActionsContext = createContext<ItemActions | null>(null);
