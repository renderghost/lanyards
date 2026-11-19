import type { ReactNode } from 'react';

/** `ui` for the product chrome; `accent` for links on the lanyard itself. */
export type ExternalLinkTone = 'ui' | 'accent';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  tone?: ExternalLinkTone;
  className?: string;
};
