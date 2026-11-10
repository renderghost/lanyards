import type { Did } from '@atcute/lexicons';

export type FollowButtonProps = {
  did: Did;
  handle: string;
  /** Where the permission notice returns to. */
  returnTo: string;
  className?: string;
};
