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

  // Resume session
  await agent.resumeSession({
    did: session.did,
    handle: session.handle,
    accessJwt: session.accessToken,
    refreshJwt: session.refreshToken,
    active: true,
  });

  return agent;
}

export async function getProfile(did: string) {
  const agent = await getAgent();

  if (!agent) {
    throw new Error('Not authenticated');
  }

  const profile = await agent.getProfile({ actor: did });
  return profile.data;
}
