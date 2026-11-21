import { cn } from '@/lib/utils';

import { STRAPS, VIEW } from './LanyardStraps.constants';
import * as styles from './LanyardStraps.styles';
import type { LanyardStrapsProps } from './LanyardStraps.types';

/** Two lanyard straps meeting above the Share badge (spec §8). */
export function LanyardStraps({ className }: LanyardStrapsProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className={cn(styles.straps, className)}
    >
      {STRAPS.map((points) => (
        <polygon key={points} points={points} />
      ))}
    </svg>
  );
}
