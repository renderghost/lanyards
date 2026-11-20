import type { LucideIcon } from 'lucide-react';

import type { Accent } from '@/design/accents';
import type { CoverPattern } from '@/design/covers';

export type FeatureCardProps = {
  title: string;
  text: string;
  icon: LucideIcon;
  /** Its own accent and cover: the homepage shows off the choices. */
  accent: Accent;
  cover: CoverPattern;
  /** For the monogram cover. */
  initials?: string;
  className?: string;
};
