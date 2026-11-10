import type { ReactNode } from 'react';

export type ItemFrameProps = {
  /** The key the owner hides the item by: an AT-URI or URL. */
  itemKey: string;
  /** The item's short name, for its menu. */
  title: string;
  children: ReactNode;
  className?: string;
};
