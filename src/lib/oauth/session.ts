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

  console.log('getSessionAgent: Looking for session cookie');
  console.log('getSessionAgent: Cookie found?', !!encryptedSession);
  console.log('getSessionAgent: Cookie value length:', encryptedSession?.value?.length || 0);

  if (!encryptedSession?.value) {
    console.log('getSessionAgent: No session cookie found');
    return null;
  }

  try {
    // Unseal the session data
    console.log('getSessionAgent: Attempting to unseal session data');
    const session = await unsealData<Session>(encryptedSession.value, { password });
    console.log('getSessionAgent: Session unsealed, DID:', session.did);

    if (!session.did) {
      console.log('getSessionAgent: No DID in session');
      return null;
    }

    // Restore OAuth session
    console.log('getSessionAgent: Restoring OAuth session for DID:', session.did);
    const oauthClient = await createOAuthClient(db);
    const oauthSession = await oauthClient.restore(session.did);
    console.log('getSessionAgent: OAuth session restored?', !!oauthSession);
    return oauthSession ? new Agent(oauthSession) : null;
  } catch (err) {
    console.error('getSessionAgent: Session restore failed:', err);
    // Clear invalid cookie
    cookieStore.delete('sid');
    return null;
  }
}

export async function getSessionDid(): Promise<string | null> {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get('sid');

  if (!encryptedSession?.value) {
    return null;
  }

  try {
    const session = await unsealData<Session>(encryptedSession.value, { password });
    return session.did || null;
  } catch (err) {
    console.warn('Failed to read session:', err);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('sid');
}
