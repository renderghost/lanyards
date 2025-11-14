/**
 * Server-side authenticated agent utilities
 *
 * Provides authenticated AtpAgent instances for server-side operations
 * using the configured app password credentials.
 */

import { AtpAgent } from '@atproto/api';
import { getConfiguredCredentials } from './app-password';

let cachedAgent: AtpAgent | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Gets an authenticated AtpAgent for server-side use
 * Uses app password authentication configured in environment variables
 *
 * @returns Authenticated AtpAgent
 * @throws Error if credentials are not configured or login fails
 */
export async function getServerAgent(): Promise<AtpAgent> {
  // Return cached agent if still valid
  if (cachedAgent && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedAgent;
  }

  const credentials = await getConfiguredCredentials();
  if (!credentials) {
    throw new Error(
      'Server authentication not configured. Set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD in .env'
    );
  }

  const agent = new AtpAgent({
    service: process.env.PDS_URL || 'https://bsky.social',
  });

  await agent.login({
    identifier: credentials.handle,
    password: credentials.password,
  });

  cachedAgent = agent;
  cacheTime = Date.now();

  return agent;
}

/**
 * Creates a public (unauthenticated) AtpAgent
 * Use this for operations that don't require authentication
 *
 * @returns Unauthenticated AtpAgent
 */
export function getPublicAgent(): AtpAgent {
  return new AtpAgent({
    service: process.env.PDS_URL || 'https://bsky.social',
  });
}
