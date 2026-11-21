import type { ReactNode } from 'react';

export type BadgeLanyardProps = {
  /** The badge, or its loading shape. */
  children: ReactNode;
  /** Printed on the straps; plain straps while it's unknown. */
  handle?: string;
  className?: string;
};
