import type { KnownFollowers } from '@/lib/sources/bluesky/bluesky.types';

export type SharedContextStripProps = {
  mutual: boolean;
  knownFollowers?: KnownFollowers;
  className?: string;
};
