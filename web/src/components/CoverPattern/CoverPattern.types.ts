import type { CoverPattern as Pattern } from '@/design/covers';

export type CoverPatternProps = {
  pattern: Pattern;
  /** The owner's initials, for the monogram. */
  initials: string;
  className?: string;
};

/** What each pattern's drawing needs. */
export type PatternProps = {
  /** Unique on the page, for the pattern's own <pattern> ids. */
  id: string;
  initials: string;
};
