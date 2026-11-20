import type { Did } from '@atcute/lexicons';

import type { ViewerMode } from '@/lib/person/personView.types';

export type HeroActionsProps = {
  did: Did;
  handle: string;
  /** The owner gets their own actions in place of Follow. */
  mode: ViewerMode;
  className?: string;
};
