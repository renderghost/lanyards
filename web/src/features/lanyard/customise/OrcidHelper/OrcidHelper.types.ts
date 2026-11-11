import type { Did } from '@atcute/lexicons';

export type OrcidHelperProps = {
  did: Did;
  /** The owner's handle, or DID when it doesn't verify (see profileId). */
  profile: string;
  /**
   * The ORCID iD on the owner's Sifa profile: `null` when there is none,
   * `undefined` while Sifa hasn't answered.
   */
  orcidId: string | null | undefined;
  className?: string;
};
