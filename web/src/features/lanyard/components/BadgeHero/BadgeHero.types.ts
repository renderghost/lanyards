import type { ReactNode } from 'react';

import type { BadgeHero } from '@/lib/person/personView.types';

export type BadgeHeroProps = {
  hero: BadgeHero;
  /** 1 on a lanyard; 2 when the badge is shown inside another page. */
  headingLevel?: 1 | 2;
  /** Follow, or the owner's own actions; none in the customiser's preview. */
  actions?: ReactNode;
  /** The Roles block, when it is shown: the board links to it. */
  rolesHref?: string;
  /** Sifa hasn't answered yet: the board keeps its place. */
  boardPending?: boolean;
  className?: string;
};
