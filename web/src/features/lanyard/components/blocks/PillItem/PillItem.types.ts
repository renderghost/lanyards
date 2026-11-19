import type { ReactNode } from 'react';

export type PillItemProps = {
  /** The key the owner hides the item by. */
  itemKey: string;
  /** The item's short name, for its controls. */
  title: string;
  label: string;
  /** Links only: on the public lanyard the whole pill is the link. */
  href?: string;
  /** Links only: a favicon or platform icon, on the left. */
  icon?: ReactNode;
  className?: string;
};
