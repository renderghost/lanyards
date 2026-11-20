import { useId } from 'react';

import { cn } from '@/lib/utils';

import { PATTERNS } from './CoverPattern.patterns';
import * as styles from './CoverPattern.styles';
import type { CoverPatternProps } from './CoverPattern.types';

/**
 * One of the badge's eight cover patterns (#129): vector, decorative, and
 * drawn in the accent's cover colours, so it recolours with the accent.
 */
export function CoverPattern({
  pattern,
  initials,
  className,
}: CoverPatternProps) {
  // url(#…) needs an id without React's punctuation.
  const id = `cover-${useId().replace(/[^\w-]/g, '')}`;
  const Pattern = PATTERNS[pattern];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      className={cn(styles.cover, className)}
    >
      <Pattern id={id} initials={initials} />
    </svg>
  );
}
