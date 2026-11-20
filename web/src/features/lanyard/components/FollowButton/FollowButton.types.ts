import type { Did } from '@atcute/lexicons';

export type FollowButtonProps = {
  did: Did;
  handle: string;
  /** Where the permission notice returns to. */
  returnTo: string;
  /** `badge` on the badge's accent field (#129). */
  tone?: 'accent' | 'badge';
  className?: string;
};
