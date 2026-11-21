import { BadgeSleeve } from '@/features/qr/components/BadgeSleeve/BadgeSleeve';
import { LanyardRibbon } from '@/features/qr/components/LanyardRibbon/LanyardRibbon';
import { cn } from '@/lib/utils';

import * as styles from './BadgeLanyard.styles';
import type { BadgeLanyardProps } from './BadgeLanyard.types';

/**
 * The lanyard a person's badge hangs from on their page (#173): straps in
 * their accent, printed with their handle, and a laminate sleeve, as on
 * the Share screen. It never sways: the badge holds buttons.
 */
export function BadgeLanyard({
  children,
  handle,
  className,
}: BadgeLanyardProps) {
  return (
    <div className={cn(styles.hang, className)}>
      <LanyardRibbon
        text={handle ? `@${handle}` : ''}
        tone="accent"
        className={styles.ribbon}
      />
      <BadgeSleeve
        ground="page"
        className={styles.sleeve}
        slotClassName={styles.slot}
      >
        {children}
      </BadgeSleeve>
    </div>
  );
}
