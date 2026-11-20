import { cn } from '@/lib/utils';

import * as styles from './LanyardSurface.styles';
import type { LanyardSurfaceProps } from './LanyardSurface.types';

/**
 * The lanyard's own ground, in its brand tokens and accent, kept apart from
 * the neutral app chrome around it (#118). There's one per page: the public
 * page, or the customiser's canvas (#122).
 */
export function LanyardSurface({ children, className }: LanyardSurfaceProps) {
  return (
    <div data-lanyard-surface="" className={cn(styles.surface, className)}>
      {children}
    </div>
  );
}
