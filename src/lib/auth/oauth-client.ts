/**
 * OAuth Client Configuration
 *
 * Note: The @atproto/oauth-client-node package requires complex setup.
 * This is a temporary type-safe placeholder implementation.
 *
 * To properly implement OAuth:
 * 1. Review AT Protocol OAuth documentation
 * 2. Set up NodeSavedStateStore and NodeSavedSessionStore
 * 3. Configure client metadata properly
 * 4. Handle DPoP tokens
 *
 * For initial development, consider using app passwords or direct API auth
 */

// Placeholder type
export type OAuthClient = {
  authorize: (handle: string) => Promise<string>;
  callback: (params: URLSearchParams) => Promise<{
    session: {
      sub: string;
      scope: string;
    };
    state: string | null;
  }>;
};

let oauthClient: OAuthClient | null = null;

export async function getOAuthClient(): Promise<OAuthClient> {
  if (oauthClient) {
    return oauthClient;
  }

  // TODO: Implement proper OAuth client initialization
  // See @atproto/oauth-client-node documentation

  throw new Error(
    'OAuth client not yet fully configured. Please set up OAuth according to AT Protocol documentation.'
  );
}

export async function createAuthUrl(handle: string): Promise<string> {
  const client = await getOAuthClient();
  return await client.authorize(handle);
}
