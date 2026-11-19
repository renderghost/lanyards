import type { ReactNode } from 'react';

/** `page` fills a public page; `card` frames a preview in the customiser. */
export type LanyardSurfaceVariant = 'page' | 'card';

export type LanyardSurfaceProps = {
  variant: LanyardSurfaceVariant;
  children: ReactNode;
  className?: string;
};
