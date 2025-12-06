import { NodeOAuthClient } from '@atproto/oauth-client-node';

import type { Database } from '@/lib/db';
import { SessionStore, StateStore } from './storage';

export const createOAuthClient = async (db: Database, baseUrl?: string) => {
  // Use baseUrl from request, fallback to local development
  const effectiveBaseUrl = baseUrl || 'http://127.0.0.1:3000';

  console.log(`[createOAuthClient] Using base URL: ${effectiveBaseUrl}`);

  const isLocal = effectiveBaseUrl.startsWith('http://');

  if (isLocal) {
    // Local development (http://127.0.0.1)
    // RFC 8252 loopback client - must use inline metadata, NOT metadata URL
    console.log('[createOAuthClient] Using loopback client (inline metadata)');
    return new NodeOAuthClient({
      clientMetadata: {
        client_name: 'Lanyards',
        client_id: `http://localhost?redirect_uri=${encodeURIComponent(
          `${effectiveBaseUrl}/oauth/callback`
        )}&scope=${encodeURIComponent('atproto transition:generic')}`,
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
  } else {
    // Production (https://)
    // Use metadata URL format
    console.log('[createOAuthClient] Using metadata URL format');
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
  }
};
