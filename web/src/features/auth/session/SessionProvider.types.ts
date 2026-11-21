import type { ReactNode } from 'react';

import type { SessionHandle } from '@/lib/atproto/session';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; session: SessionHandle };

export type SessionContextValue = SessionState & {
  /**
   * Ends the session. `leave`, if given, runs once it has ended and before
   * anyone is shown as signed out: say where to go next there (#172), so
   * a page that needs a session never sends people off to sign in again.
   * Meanwhile the status is `loading`.
   */
  signOut(leave?: () => Promise<unknown>): Promise<void>;
  /** Re-reads the stored session, e.g. right after the OAuth callback. */
  refresh(): Promise<void>;
};

export type SessionProviderProps = {
  children: ReactNode;
};
