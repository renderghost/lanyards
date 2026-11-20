import type { ReactNode } from 'react';

export type HomeSectionProps = {
  /** A short label above the heading, in the badge's label style. */
  eyebrow?: string;
  heading: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
};
