import type { ReactNode } from 'react';

export type AppHeaderProps = {
  /** Names the area the person is in, beside the logo (from `md` up). */
  title?: string;
  /** Replaces the header's own links, for a route with its own controls. */
  actions?: ReactNode;
  className?: string;
};
