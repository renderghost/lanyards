import type { ReactNode } from 'react';

/** `ui` for the product chrome; `accent` for links on the lanyard itself. */
export type ExternalLinkTone = 'ui' | 'accent';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  tone?: ExternalLinkTone;
  /**
   * Its name when the visible text alone doesn't say what it opens (e.g.
   * a date); it must contain that text.
   */
  label?: string;
  className?: string;
};
