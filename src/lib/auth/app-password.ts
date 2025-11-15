/**
 * App Password Authentication
 *
 * User-facing authentication using Bluesky app passwords.
 *
 * To create an app password:
 * 1. Go to https://bsky.app/settings/app-passwords
 * 2. Create a new app password
 * 3. Use it to sign in through the app's login form
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
