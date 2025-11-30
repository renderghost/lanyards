import { unsealData, sealData } from 'iron-session';
import { cookies } from 'next/headers';
import { Agent } from '@atproto/api';

import type { Database } from '@/lib/db';
import { createOAuthClient } from './client';

type Session = { did: string };

const password = process.env.COOKIE_SECRET || 'complex_password_at_least_32_characters_long';

export async function getSessionAgent(db: Database): Promise<Agent | null> {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get('sid');

  console.log('[getSessionAgent] Looking for session cookie');
  console.log('[getSessionAgent] Cookie found?', !!encryptedSession);
  console.log('[getSessionAgent] Cookie value length:', encryptedSession?.value?.length || 0);

  // Log all cookies for debugging
  const allCookies = await cookieStore.getAll();
  console.log('[getSessionAgent] All cookies:', allCookies.map(c => ({ name: c.name, valueLength: c.value?.length })));

  if (!encryptedSession?.value) {
    console.log('[getSessionAgent] No session cookie found');
    return null;
  }

  try {
    // Unseal the session data
    console.log('[getSessionAgent] Attempting to unseal session data');
    const session = await unsealData<Session>(encryptedSession.value, { password });
    console.log('[getSessionAgent] Session unsealed, DID:', session.did);

    if (!session.did) {
      console.log('[getSessionAgent] No DID in session');
      return null;
    }

    // Restore OAuth session
    console.log('[getSessionAgent] Restoring OAuth session for DID:', session.did);

    // Determine baseUrl from headers to support dynamic ports (e.g. 3001)
    let baseUrl: string | undefined;
    try {
      // We already have cookies, but we need headers for host
      // Note: In Next.js Server Components/Actions, we can import headers
      const { headers } = await import('next/headers');
      const headersList = await headers();
      const host = headersList.get('host');
      const proto = headersList.get('x-forwarded-proto') || 'http';
      if (host) {
        baseUrl = `${proto}://${host}`;
        console.log('[getSessionAgent] Derived baseUrl from headers:', baseUrl);
      }
    } catch (e) {
      console.warn('[getSessionAgent] Could not determine baseUrl from headers:', e);
    }

    const oauthClient = await createOAuthClient(db, baseUrl);
    const oauthSession = await oauthClient.restore(session.did);
    console.log('[getSessionAgent] OAuth session restored?', !!oauthSession);

    if (!oauthSession) {
      console.log('[getSessionAgent] WARNING: Failed to restore OAuth session for DID:', session.did);
      return null;
    }

    return new Agent(oauthSession);
  } catch (err) {
    console.error('[getSessionAgent] Session restore failed:', err);
    console.error('[getSessionAgent] Error type:', err instanceof Error ? err.constructor.name : typeof err);
    console.error('[getSessionAgent] Error message:', err instanceof Error ? err.message : String(err));
    // Clear invalid cookie
    cookieStore.delete('sid');
    return null;
  }
}

export async function getSessionDid(): Promise<string | null> {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get('sid');

  console.log('[getSessionDid] Looking for session cookie');
  console.log('[getSessionDid] Cookie found?', !!encryptedSession);

  if (!encryptedSession?.value) {
    return null;
  }

  try {
    const session = await unsealData<Session>(encryptedSession.value, { password });
    console.log('[getSessionDid] Unsealed session, DID:', session.did);
    return session.did || null;
  } catch (err) {
    console.error('[getSessionDid] Failed to read session:', err);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('sid');
}
