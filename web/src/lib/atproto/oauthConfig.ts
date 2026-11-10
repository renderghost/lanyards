/**
 * OAuth configuration shared by the app and the build-time metadata plugin.
 * Pure: no browser or Node APIs, so both contexts can import it.
 */

/** Identity only. Later slices add granular repo scopes. */
export const OAUTH_SCOPE = 'atproto';

/** Where new accounts are created when someone has no AT Protocol account. */
export const SIGN_UP_PDS = 'https://bsky.social';

export const REDIRECT_PATH = '/oauth/callback';
export const METADATA_PATH = '/oauth-client-metadata.json';
export const LOGO_PATH = '/pwa-192x192.png';
export const DID_STORAGE_KEY = 'lanyards:did';
export const DEV_BASE_URL = 'http://127.0.0.1:5173';

const LOOPBACK_ORIGIN = /^http:\/\/127\.0\.0\.1:\d+$/;
const MAX_RETURN_TO_LENGTH = 512;

export type ClientMetadata = {
  client_id: string;
  client_name: string;
  client_uri: string;
  logo_uri: string;
  redirect_uris: string[];
  scope: string;
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: 'none';
  application_type: 'web';
  dpop_bound_access_tokens: true;
};

export type OAuthEnv = {
  clientId: string;
  redirectUri: string;
  /** Null for the loopback client, which has no hosted metadata. */
  metadata: ClientMetadata | null;
};

export function resolveBaseUrl(input: {
  command: 'serve' | 'build';
  env: Record<string, string | undefined>;
}): string {
  if (input.command === 'serve') return DEV_BASE_URL;
  const { PUBLIC_BASE_URL, VERCEL_ENV, VERCEL_BRANCH_URL } = input.env;
  if (PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/+$/, '');
  if (VERCEL_ENV === 'preview' && VERCEL_BRANCH_URL) {
    return `https://${VERCEL_BRANCH_URL}`;
  }
  throw new Error('PUBLIC_BASE_URL must be set for production builds');
}

export function buildOAuthEnv(baseUrl: string, scope: string): OAuthEnv {
  const redirectUri = `${baseUrl}${REDIRECT_PATH}`;

  if (LOOPBACK_ORIGIN.test(baseUrl)) {
    // RFC 8252 loopback client: the client_id host is literally localhost,
    // while every redirect URI uses 127.0.0.1.
    const clientId =
      `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}`;
    return { clientId, redirectUri, metadata: null };
  }

  if (!baseUrl.startsWith('https://')) {
    throw new Error(
      `OAuth needs https or http://127.0.0.1:<port>, got ${baseUrl}`
    );
  }

  const clientId = `${baseUrl}${METADATA_PATH}`;
  return {
    clientId,
    redirectUri,
    metadata: {
      client_id: clientId,
      client_name: 'Lanyards',
      client_uri: baseUrl,
      logo_uri: `${baseUrl}${LOGO_PATH}`,
      redirect_uris: [redirectUri],
      scope,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      application_type: 'web',
      dpop_bound_access_tokens: true,
    },
  };
}

/** Returns `value` only when it is a same-origin path; otherwise '/'. */
export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value.length > MAX_RETURN_TO_LENGTH ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return '/';
  }
  return value;
}
