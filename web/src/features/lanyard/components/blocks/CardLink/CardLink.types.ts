import type { ReactNode } from 'react';

export type CardLinkProps = {
  href: string;
  children: ReactNode;
  /** Its name when the text alone doesn't say what it opens; must contain it. */
  label?: string;
  className?: string;
};
