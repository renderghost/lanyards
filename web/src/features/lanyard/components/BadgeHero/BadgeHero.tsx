import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { heroName } from '@/lib/person/hero';
import { cn } from '@/lib/utils';

import { BadgeLanyard } from '../BadgeLanyard/BadgeLanyard';
import { DepartureBoard } from '../DepartureBoard/DepartureBoard';
import * as styles from './BadgeHero.styles';
import type { BadgeHeroProps } from './BadgeHero.types';

/**
 * The badge at the top of a lanyard (spec §7): the cover, the accent field
 * with the name in billboard type, and the departure board. It hangs in a
 * laminate sleeve from a lanyard printed with the handle, as on the Share
 * screen (#173), but never sways: it holds buttons, which must stay put.
 */
export function BadgeHero({
  hero,
  headingLevel = 1,
  actions,
  rolesHref,
  boardPending,
  className,
}: BadgeHeroProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';
  const meta = [hero.pronouns, `@${hero.handle}`].filter(Boolean).join(' · ');

  return (
    <BadgeLanyard handle={hero.handle} className={className}>
      <section className={styles.badge} aria-labelledby="badge-name">
        <div className={styles.cover} data-cover>
          <CoverPattern pattern={hero.cover} initials={hero.initials} />
        </div>
        <div className={styles.field} data-field>
          <div className={styles.identity}>
            <div className={styles.avatarBox}>
              {hero.avatar ? (
                <img
                  src={hero.avatar}
                  alt=""
                  width={136}
                  height={136}
                  className={styles.avatar}
                />
              ) : (
                <span
                  className={cn(styles.avatar, styles.initials)}
                  aria-hidden="true"
                >
                  {hero.initials}
                </span>
              )}
            </div>
            <div className={styles.heading}>
              <Heading id="badge-name" className={styles.name}>
                {heroName(hero)}
              </Heading>
              <p className={styles.meta}>{meta}</p>
            </div>
            {hero.headline && (
              <p className={styles.headline}>{hero.headline}</p>
            )}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <DepartureBoard
          role={hero.role}
          location={hero.location}
          openTo={hero.openTo}
          rolesHref={rolesHref}
          pending={boardPending}
        />
      </section>
    </BadgeLanyard>
  );
}
