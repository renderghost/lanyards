/**
 * Legacy Session Management - OAuth Compatibility Layer
 *
 * This module provides backward compatibility for code that uses the old
 * session interface. It proxies to the new OAuth session management.
 */

import {
  getSessionDid,
  deleteSession as deleteOAuthSession,
} from '@/lib/oauth/session';

export interface Session {
  did: string;
  handle: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function getSession(): Promise<Session | null> {
  console.log('[getSession] Starting...');
  const did = await getSessionDid();
  console.log('[getSession] Got DID:', did);

  if (!did) {
    console.log('[getSession] No DID, returning null');
    return null;
  }

  const session = {
    did,
    handle: did,
    accessToken: '',
    refreshToken: '',
    expiresAt: Date.now() + 60 * 60 * 24 * 30 * 1000,
  };
  console.log('[getSession] Returning session:', session);
  return session;
}

export async function deleteSession(): Promise<void> {
  await deleteOAuthSession();
}

export async function isAuthenticated(): Promise<boolean> {
  const did = await getSessionDid();
  return did !== null;
}

export async function createSession(_session: Session): Promise<void> {
  throw new Error(
    'createSession is deprecated. Use OAuth flow for authentication.'
  );
}
