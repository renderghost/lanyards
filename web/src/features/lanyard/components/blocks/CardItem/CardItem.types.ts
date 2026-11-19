import type { ReactNode } from 'react';

export type CardItemProps = {
  /** The key the owner hides the item by. */
  itemKey: string;
  /** The item's short name, for its controls. */
  title: string;
  /** A picture or icon on the left. */
  thumbnail?: ReactNode;
  /** The card's text, with at most one CardLink. */
  children: ReactNode;
  className?: string;
};
