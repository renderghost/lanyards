/**
 * OAuth Client Placeholder
 *
 * The @atproto/oauth-client-node package has a complex setup that requires:
 * - Proper client metadata configuration
 * - State and session stores
 * - DPoP (Demonstrated Proof of Possession) setup
 *
 * For now, this is a placeholder. To implement properly:
 * 1. Follow the AT Protocol OAuth documentation
 * 2. Set up proper session and state storage
 * 3. Configure client metadata correctly
 *
 * Alternative: Use direct API authentication instead of OAuth for simpler setup
 */

export async function getOAuthClient() {
  throw new Error(
    'OAuth client not yet fully implemented. Please configure OAuth according to AT Protocol documentation.'
  );
}

export async function createAuthUrl(_handle: string): Promise<string> {
  throw new Error(
    'OAuth client not yet fully implemented. Please configure OAuth according to AT Protocol documentation.'
  );
}
