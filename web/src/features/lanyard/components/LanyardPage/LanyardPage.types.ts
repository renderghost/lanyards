import type { Did } from '@atcute/lexicons';

export type LanyardPageProps = {
  did: Did;
  /** The handle in the URL, for messages before the profile loads. */
  handle?: string;
  className?: string;
};
