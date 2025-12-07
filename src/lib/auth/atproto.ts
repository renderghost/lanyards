import { Agent } from '@atproto/api';
import { getDb } from '@/lib/db-instance';
import { getSessionAgent } from '@/lib/oauth/session';

export async function getAgent(): Promise<Agent | null> {
  console.log('[getAgent] Starting...');
  const db = await getDb();
  console.log('[getAgent] DB initialized');
  const agent = await getSessionAgent(db);
  console.log('[getAgent] Got agent?', !!agent);
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
