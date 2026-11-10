import { cn } from '@/lib/utils';

import * as styles from './BadgeHero.styles';
import type { BadgeHeroProps } from './BadgeHero.types';

/** The badge at the top of a lanyard (spec §7.1). */
export function BadgeHero({
  hero,
  headingLevel = 1,
  className,
}: BadgeHeroProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';
  const name = [hero.honorific, hero.displayName].filter(Boolean).join(' ');
  const job = hero.job
    ? [hero.job.title, hero.job.company].filter(Boolean).join(' · ')
    : undefined;

  return (
    <section
      className={cn(styles.badge, className)}
      aria-labelledby="badge-name"
    >
      {hero.avatar ? (
        <img
          src={hero.avatar}
          alt=""
          width={96}
          height={96}
          className={styles.avatar}
        />
      ) : (
        <span className={styles.avatar} aria-hidden="true" />
      )}
      <div className={styles.text}>
        <Heading id="badge-name" className={styles.name}>
          {name}
        </Heading>
        {hero.pronouns && <p className={styles.pronouns}>{hero.pronouns}</p>}
        {hero.headline && <p className={styles.headline}>{hero.headline}</p>}
        {job && <p className={styles.job}>{job}</p>}
        <p className={styles.handle}>@{hero.handle}</p>
      </div>
    </section>
  );
}
