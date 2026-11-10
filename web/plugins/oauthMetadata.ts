import { loadEnv, type Plugin } from 'vite';

import {
  buildOAuthEnv,
  type ClientMetadata,
  CLIENT_SCOPE,
  resolveBaseUrl,
} from '../src/lib/atproto/oauthConfig.ts';

/**
 * Exposes the OAuth client id, redirect URI and base URL to the app, and, for
 * https builds, emits the hosted oauth-client-metadata.json.
 */
export function oauthMetadataPlugin(): Plugin {
  let metadata: ClientMetadata | null = null;

  return {
    name: 'lanyards:oauth-metadata',
    config(_config, { command, mode }) {
      const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
      const baseUrl = resolveBaseUrl({ command, env });
      const oauth = buildOAuthEnv(baseUrl, CLIENT_SCOPE);
      metadata = oauth.metadata;
      return {
        define: {
          'import.meta.env.VITE_OAUTH_CLIENT_ID': JSON.stringify(
            oauth.clientId
          ),
          'import.meta.env.VITE_OAUTH_REDIRECT_URI': JSON.stringify(
            oauth.redirectUri
          ),
          'import.meta.env.VITE_PUBLIC_BASE_URL': JSON.stringify(baseUrl),
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
