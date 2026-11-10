import { Globe } from 'lucide-react';

import { cn } from '@/lib/utils';

import { MARKS } from './PlatformIcon.constants';
import * as styles from './PlatformIcon.styles';
import type { PlatformIconProps } from './PlatformIcon.types';

/** A decorative platform mark; the link text carries the meaning. */
export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const mark = MARKS[platform];
  if (!mark) {
    return <Globe aria-hidden="true" className={cn(styles.icon, className)} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn(styles.icon, className)}
    >
      <path d={mark.path} fill="currentColor" />
    </svg>
  );
}
