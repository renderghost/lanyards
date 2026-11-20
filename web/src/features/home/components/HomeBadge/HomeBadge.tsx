import { useLingui } from '@lingui/react/macro';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { Logo } from '@/components/Logo/Logo';
import { LanyardStraps } from '@/features/qr/components/LanyardStraps/LanyardStraps';
import { cn } from '@/lib/utils';

import { ACCENT, BOARD, COVER } from './HomeBadge.constants';
import * as styles from './HomeBadge.styles';
import type { HomeBadgeProps } from './HomeBadge.types';

/**
 * Lanyards' own billboard badge, hanging from its straps at the top of the
 * homepage (#145): the old homepage's welcome, in the new design language.
 */
export function HomeBadge({ headingId, className }: HomeBadgeProps) {
  const { t, i18n } = useLingui();
  return (
    <div data-accent={ACCENT} className={cn(styles.stage, className)}>
      <div className={styles.hang}>
        <LanyardStraps className={styles.straps} />
        <div className={styles.badge}>
          <div className={styles.cover}>
            <CoverPattern pattern={COVER} initials="L" />
            <span aria-hidden="true" className={styles.slot} />
          </div>
          <div className={styles.field}>
            <div className={styles.logoBox}>
              <Logo fixed="blue" className={styles.logo} />
            </div>
            <h1 id={headingId} className={styles.name}>
              {t`Welcome to Lanyards`}
            </h1>
            <p className={styles.statement}>
              {t`The curated link for academic researchers that collects your complete scholarly presence—publications, talks, affiliations, and social profiles.`}
            </p>
          </div>
          <dl className={styles.board}>
            {BOARD.map((cell) => (
              <div key={cell.label.id} className={styles.cell}>
                <dt className={styles.label}>{i18n._(cell.label)}</dt>
                <dd className={styles.value}>{i18n._(cell.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
