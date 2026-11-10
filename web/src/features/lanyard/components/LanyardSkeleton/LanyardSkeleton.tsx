import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import * as styles from './LanyardSkeleton.styles';
import type { LanyardSkeletonProps } from './LanyardSkeleton.types';

/** Holds the badge's place, at its size, while the profile loads. */
export function LanyardSkeleton({ className }: LanyardSkeletonProps) {
  const { t } = useLingui();
  return (
    <div className={cn(styles.page, className)}>
      <div className={styles.badge} role="status">
        <span className={styles.srOnly}>{t`Loading lanyard…`}</span>
        <span className={styles.avatar} aria-hidden="true" />
        <span className={styles.line} aria-hidden="true" />
      </div>
    </div>
  );
}
