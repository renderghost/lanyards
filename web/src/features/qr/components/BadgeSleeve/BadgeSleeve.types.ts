import type { ReactNode, Ref } from 'react';

export type BadgeSleeveProps = {
  /** The badge it holds. */
  children: ReactNode;
  /** The sleeve: the element that turns, if it sways. */
  ref?: Ref<HTMLDivElement>;
  className?: string;
  /** The lip's slot, where the clasp goes through. */
  slotClassName?: string;
  /** The light on the plastic. */
  glareClassName?: string;
};
