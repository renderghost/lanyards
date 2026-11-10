import type { BadgeHero } from '@/lib/person/personView.types';

export type BadgeHeroProps = {
  hero: BadgeHero;
  /** 1 on a lanyard; 2 when the badge is shown inside another page. */
  headingLevel?: 1 | 2;
  className?: string;
};
