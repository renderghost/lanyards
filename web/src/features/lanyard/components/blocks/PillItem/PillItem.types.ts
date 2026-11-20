import type { ReactNode } from 'react';

export type PillItemProps = {
  /** The key the owner hides the item by. */
  itemKey: string;
  /** The item's short name, for its controls. */
  title: string;
  label: string;
  /** Links only: on the public lanyard the whole pill is the link. */
  href?: string;
  /** A favicon, platform icon or marker, on the left. */
  icon?: ReactNode;
  className?: string;
};
