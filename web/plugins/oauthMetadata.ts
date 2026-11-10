import { loadEnv, type Plugin } from 'vite';

import {
  buildOAuthEnv,
  type ClientMetadata,
  OAUTH_SCOPE,
  resolveBaseUrl,
} from '../src/lib/atproto/oauthConfig';

/**
 * Exposes the OAuth client id, redirect URI and scope to the app, and, for
 * https builds, emits the hosted oauth-client-metadata.json.
 */
export function oauthMetadataPlugin(): Plugin {
  let metadata: ClientMetadata | null = null;

  return {
    name: 'lanyards:oauth-metadata',
    config(_config, { command, mode }) {
      const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
      const oauth = buildOAuthEnv(
        resolveBaseUrl({ command, env }),
        OAUTH_SCOPE
      );
      metadata = oauth.metadata;
      return {
        define: {
          'import.meta.env.VITE_OAUTH_CLIENT_ID': JSON.stringify(
            oauth.clientId
          ),
          'import.meta.env.VITE_OAUTH_REDIRECT_URI': JSON.stringify(
            oauth.redirectUri
          ),
          'import.meta.env.VITE_OAUTH_SCOPE': JSON.stringify(OAUTH_SCOPE),
        },
      };
    },
    generateBundle() {
      if (!metadata) return;
      this.emitFile({
        type: 'asset',
        fileName: 'oauth-client-metadata.json',
        source: `${JSON.stringify(metadata, null, 2)}\n`,
      });
    },
  };
}
