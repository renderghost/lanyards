import type { Did } from '@atcute/lexicons';

export type VisitorActionsProps = {
  did: Did;
  handle: string;
  /** The viewer is the lanyard's owner. */
  owner: boolean;
  className?: string;
};
