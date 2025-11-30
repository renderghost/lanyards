import { NodeOAuthClient } from '@atproto/oauth-client-node';

import type { Database } from '@/lib/db';
import { SessionStore, StateStore } from './storage';

export const createOAuthClient = async (db: Database) => {
  const publicUrl = process.env.PUBLIC_URL;

  // For production, use PUBLIC_URL
  // For development, use the special loopback client format that bypasses validation
  if (publicUrl) {
    return new NodeOAuthClient({
      clientMetadata: {
        client_name: 'Lanyards',
        client_id: `${publicUrl}/oauth-client-metadata.json`,
        client_uri: publicUrl,
        redirect_uris: [`${publicUrl}/oauth/callback`],
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
  }

  // Development: Use loopback client format (bypass client_id validation)
  const enc = encodeURIComponent;
  const redirectUri = 'http://127.0.0.1:3000/oauth/callback';
  const scope = 'atproto transition:generic';

  return new NodeOAuthClient({
    clientMetadata: {
      client_name: 'Lanyards',
      // Loopback format: uses localhost with query params to bypass URL validation
      client_id: `http://localhost/?redirect_uri=${enc(redirectUri)}&scope=${enc(scope)}`,
      client_uri: 'http://127.0.0.1:3000',
      redirect_uris: [redirectUri],
      scope,
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
