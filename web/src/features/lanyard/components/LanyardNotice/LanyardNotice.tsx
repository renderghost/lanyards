import { cn } from '@/lib/utils';

import * as styles from './LanyardNotice.styles';
import type { LanyardNoticeProps } from './LanyardNotice.types';

/** A minimal page in place of a lanyard: unavailable, opted out, blocked. */
export function LanyardNotice({
  heading,
  children,
  className,
}: LanyardNoticeProps) {
  return (
    <section className={cn(styles.notice, className)}>
      <h1 className={styles.heading}>{heading}</h1>
      {children}
    </section>
  );
}
