/**
 * App Password Authentication
 *
 * Simpler authentication method using Bluesky app passwords.
 * Recommended for local development and testing.
 *
 * To create an app password:
 * 1. Go to https://bsky.app/settings/app-passwords
 * 2. Create a new app password
 * 3. Add it to your .env file
 */

import { AtpAgent } from '@atproto/api';

export async function loginWithAppPassword(
  identifier: string,
  password: string,
  pdsUrl?: string
): Promise<{
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}> {
  const serviceUrl = pdsUrl || process.env.PDS_URL || 'https://bsky.social';

  const agent = new AtpAgent({
    service: serviceUrl,
  });

  const response = await agent.login({
    identifier,
    password,
  });

  if (!response.success) {
    throw new Error('Login failed');
  }

  return {
    did: response.data.did,
    handle: response.data.handle,
    accessJwt: response.data.accessJwt,
    refreshJwt: response.data.refreshJwt,
  };
}

export async function getConfiguredCredentials(): Promise<{
  handle: string;
  password: string;
} | null> {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    return null;
  }

  return { handle, password };
}
