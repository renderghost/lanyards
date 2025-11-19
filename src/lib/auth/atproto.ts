import { AtpAgent } from '@atproto/api';
import { getSession } from './session';

export async function getAgent(): Promise<AtpAgent | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  try {
    // Resume session
    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessToken,
      refreshJwt: session.refreshToken,
      active: true,
    });

    return agent;
  } catch (error: unknown) {
    // If token is expired or invalid, return null silently
    // Session cleanup should be handled by auth routes or server actions
    // Check for expected token errors
    const err = error as { error?: string; message?: string };
    const isExpiredToken = err.error === 'ExpiredToken' ||
                           err.error === 'InvalidToken' ||
                           err.message?.toLowerCase().includes('expired') ||
                           err.message?.toLowerCase().includes('invalid');

    if (!isExpiredToken) {
      console.error('Failed to resume session:', error);
    }
    return null;
  }
}

export async function getProfile(did: string) {
  const agent = await getAgent();

  if (!agent) {
    throw new Error('Not authenticated');
  }

  const profile = await agent.getProfile({ actor: did });
  return profile.data;
}
