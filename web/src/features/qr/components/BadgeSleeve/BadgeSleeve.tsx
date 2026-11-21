import { cn } from '@/lib/utils';

import * as styles from './BadgeSleeve.styles';
import type { BadgeSleeveProps } from './BadgeSleeve.types';

/**
 * The clear sleeve a badge hangs in (#169), on the Share screen, the
 * homepage and the sign-in page (#170). Its lip's slot is where a
 * LanyardRibbon's clasp goes through.
 */
export function BadgeSleeve({
  children,
  ref,
  className,
  slotClassName,
  glareClassName,
}: BadgeSleeveProps) {
  return (
    <div ref={ref} data-sleeve className={cn(styles.sleeve, className)}>
      <span aria-hidden="true" className={cn(styles.slot, slotClassName)} />
      <span aria-hidden="true" className={cn(styles.glare, glareClassName)} />
      {children}
    </div>
  );
}
