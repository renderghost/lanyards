import { cn } from '@/lib/utils';

import * as styles from './LanyardSurface.styles';
import type { LanyardSurfaceProps } from './LanyardSurface.types';

/**
 * The lanyard's own ground, in its brand tokens and accent, kept apart from
 * the neutral app chrome around it (#118).
 */
export function LanyardSurface({
  variant,
  children,
  className,
}: LanyardSurfaceProps) {
  return (
    <div className={cn(styles.variants[variant], className)}>{children}</div>
  );
}
