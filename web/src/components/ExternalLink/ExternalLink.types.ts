import type { ReactNode } from 'react';

/**
 * `ui` for the product chrome; `accent` for links on the lanyard itself;
 * `badge` for links on the badge's accent field (#129).
 */
export type ExternalLinkTone = 'ui' | 'accent' | 'badge';

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
