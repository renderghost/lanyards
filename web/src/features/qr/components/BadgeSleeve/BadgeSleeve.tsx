import { cn } from '@/lib/utils';

import * as styles from './BadgeSleeve.styles';
import type { BadgeSleeveProps } from './BadgeSleeve.types';

/**
 * The clear sleeve a badge hangs in (#169), on the Share screen, the
 * homepage and the sign-in page (#170), and on a person's lanyard page
 * (#173). Its lip's slot is where a LanyardRibbon's clasp goes through.
 */
export function BadgeSleeve({
  children,
  ref,
  ground = 'brand',
  inert,
  className,
  slotClassName,
  glareClassName,
}: BadgeSleeveProps) {
  return (
    <div
      ref={ref}
      data-sleeve
      inert={inert}
      // Inert is out of the accessibility tree already; say so to every
      // tool, too.
      aria-hidden={inert ? true : undefined}
      className={cn(styles.sleeve, styles.grounds[ground].sleeve, className)}
    >
      <span
        aria-hidden="true"
        className={cn(styles.slot, styles.grounds[ground].slot, slotClassName)}
      />
      <span aria-hidden="true" className={cn(styles.glare, glareClassName)} />
      {children}
    </div>
  );
}
