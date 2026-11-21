import type { ReactNode } from 'react';

export type HomeBadgeProps = {
  /** The page's one h1. */
  headingId: string;
  /** Which way it faces: the welcome, or its back (#175). */
  face?: 'front' | 'back';
  /** What's on its back: the sign-in form (#175). */
  back?: ReactNode;
  className?: string;
};
