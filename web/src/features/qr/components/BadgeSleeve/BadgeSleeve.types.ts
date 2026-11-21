import type { ReactNode, Ref } from 'react';

export type BadgeSleeveProps = {
  /** The badge it holds. */
  children: ReactNode;
  /** The sleeve: the element that turns, if it sways. */
  ref?: Ref<HTMLDivElement>;
  /** What it hangs on: the brand ground (the default), or a page (#173). */
  ground?: 'brand' | 'page';
  className?: string;
  /** The lip's slot, where the clasp goes through. */
  slotClassName?: string;
  /** The light on the plastic. */
  glareClassName?: string;
};
