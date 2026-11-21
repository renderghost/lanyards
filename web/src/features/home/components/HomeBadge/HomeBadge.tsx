import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { Logo } from '@/components/Logo/Logo';
import { BadgeSleeve } from '@/features/qr/components/BadgeSleeve/BadgeSleeve';
import { LanyardRibbon } from '@/features/qr/components/LanyardRibbon/LanyardRibbon';
import { BRAND_PRINT } from '@/features/qr/components/LanyardRibbon/LanyardRibbon.constants';
import { useLanyardSway } from '@/features/qr/useLanyardSway';
import { cn } from '@/lib/utils';

import { ACCENT, BOARD, COVER } from './HomeBadge.constants';
import * as styles from './HomeBadge.styles';
import type { HomeBadgeProps } from './HomeBadge.types';

/**
 * Lanyards' own billboard badge, hanging at the top of the homepage
 * (#145): the old homepage's welcome, in the new design language. It
 * hangs in a clear sleeve from a lanyard printed with the site's address,
 * as a person's does on the Share screen (#170). It hangs straight, swings
 * in as it arrives, and a mouse brushing past sways it and its lanyard,
 * with real physics (#151, #174). Signing in turns it over, on its clasp,
 * to the form on its back (#175): both faces share one place, so they're
 * the same size, and the one turned away is out of reach (inert, so the
 * app's focus after navigating lands on the face that's up). While it
 * shows its back it hangs still, for the form.
 */
export function HomeBadge({
  headingId,
  face = 'front',
  back,
  className,
}: HomeBadgeProps) {
  const { t, i18n } = useLingui();
  const [lanyard, setLanyard] = useState<HTMLDivElement | null>(null);
  const [swing, setSwing] = useState<HTMLDivElement | null>(null);
  const [ribbon, setRibbon] = useState<SVGSVGElement | null>(null);
  useLanyardSway({
    area: lanyard,
    sleeve: swing,
    ribbon,
    enabled: face === 'front',
    arrive: true,
  });

  return (
    <div data-accent={ACCENT} className={cn(styles.stage, className)}>
      <div ref={setLanyard} className={styles.hang}>
        <LanyardRibbon
          ref={setRibbon}
          text={BRAND_PRINT}
          className={styles.ribbon}
        />
        <div ref={setSwing} data-swing className={styles.swing}>
          <div data-face={face} className={styles.turn}>
            <BadgeSleeve
              inert={face !== 'front'}
              className={styles.front}
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
            <BadgeSleeve
              inert={face !== 'back'}
              className={styles.back}
              slotClassName={styles.slot}
            >
              {back}
            </BadgeSleeve>
          </div>
        </div>
      </div>
    </div>
  );
}
