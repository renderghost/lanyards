import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import * as styles from './LanyardSkeleton.styles';
import type { LanyardSkeletonProps } from './LanyardSkeleton.types';

/** Holds the badge's place, in its shape, while the profile loads. */
export function LanyardSkeleton({ className }: LanyardSkeletonProps) {
  const { t } = useLingui();
  return (
    <div className={cn(styles.page, className)}>
      <div className={styles.badge} role="status">
        <span className={styles.srOnly}>{t`Loading lanyard…`}</span>
        <span className={styles.cover} aria-hidden="true" />
        <span className={styles.field} aria-hidden="true">
          <span className={styles.avatarBox}>
            <span className={styles.avatar} />
          </span>
          <span className={styles.name} />
          <span className={styles.line} />
        </span>
        <span className={styles.board} aria-hidden="true" />
      </div>
    </div>
  );
}
