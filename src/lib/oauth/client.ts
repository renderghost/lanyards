import { NodeOAuthClient } from '@atproto/oauth-client-node';

import type { Database } from '@/lib/db';
import { SessionStore, StateStore } from './storage';

export const createOAuthClient = async (db: Database, baseUrl?: string) => {
  // Determine the base URL for this environment
  // Priority: PUBLIC_URL (set in production) > baseUrl (from request) > fallback
  const effectiveBaseUrl = process.env.PUBLIC_URL || baseUrl || 'http://127.0.0.1:3000';

  console.log(`[createOAuthClient] Using base URL: ${effectiveBaseUrl}`);

  // Always use the metadata URL format - this works for ALL environments
  // The /oauth-client-metadata.json route dynamically returns the correct config
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: 'Lanyards',
      client_id: `${effectiveBaseUrl}/oauth-client-metadata.json`,
      client_uri: effectiveBaseUrl,
      redirect_uris: [`${effectiveBaseUrl}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      application_type: 'web',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
  });
};
