import type { ReactNode } from 'react';

import type { SessionHandle } from '@/lib/atproto/session';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; session: SessionHandle };

export type SessionContextValue = SessionState & {
  signOut(): Promise<void>;
  /** Re-reads the stored session, e.g. right after the OAuth callback. */
  refresh(): Promise<void>;
};

export type SessionProviderProps = {
  children: ReactNode;
};
