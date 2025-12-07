/**
 * Legacy Session Management - OAuth Compatibility Layer
 *
 * This module provides backward compatibility for code that uses the old
 * session interface. It proxies to the new OAuth session management.
 */

import {
  getSessionData,
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
  const sessionData = await getSessionData();
  console.log('[getSession] Got session data:', sessionData);

  if (!sessionData?.did) {
    console.log('[getSession] No DID, returning null');
    return null;
  }

  const session = {
    did: sessionData.did,
    handle: sessionData.handle || sessionData.did,
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
  const sessionData = await getSessionData();
  return sessionData?.did !== null && sessionData?.did !== undefined;
}

export async function createSession(_session: Session): Promise<void> {
  throw new Error(
    'createSession is deprecated. Use OAuth flow for authentication.'
  );
}
