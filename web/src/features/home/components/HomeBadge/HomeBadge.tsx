import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { Logo } from '@/components/Logo/Logo';
import { BadgeSleeve } from '@/features/qr/components/BadgeSleeve/BadgeSleeve';
import { LanyardRibbon } from '@/features/qr/components/LanyardRibbon/LanyardRibbon';
import { BRAND_PRINT } from '@/features/qr/components/LanyardRibbon/LanyardRibbon.constants';
import { cn } from '@/lib/utils';

import { usePointerSway } from '../../usePointerSway';
import { ACCENT, BOARD, COVER } from './HomeBadge.constants';
import * as styles from './HomeBadge.styles';
import type { HomeBadgeProps } from './HomeBadge.types';

/**
 * Lanyards' own billboard badge, hanging at the top of the homepage
 * (#145): the old homepage's welcome, in the new design language. It
 * hangs in a clear sleeve from a lanyard printed with the site's address,
 * as a person's does on the Share screen (#170). A mouse moving across the
 * lanyard sways the sleeve on its clasp (#151).
 */
export function HomeBadge({ headingId, className }: HomeBadgeProps) {
  const { t, i18n } = useLingui();
  const lanyard = useRef<HTMLDivElement>(null);
  const sleeve = useRef<HTMLDivElement>(null);
  usePointerSway(lanyard, sleeve);
  return (
    <div data-accent={ACCENT} className={cn(styles.stage, className)}>
      <div ref={lanyard} className={styles.hang}>
        <LanyardRibbon text={BRAND_PRINT} className={styles.ribbon} />
        <BadgeSleeve
          ref={sleeve}
          className={styles.sleeve}
          slotClassName={styles.slot}
        >
          <div className={styles.badge}>
            <div className={styles.cover}>
              <CoverPattern pattern={COVER} initials="L" />
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
        </BadgeSleeve>
      </div>
    </div>
  );
}
