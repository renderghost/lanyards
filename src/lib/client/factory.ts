/**
 * Factory for creating Lanyard API clients with authentication
 * Bridges Agent/AtpAgent session management with XrpcClient
 */

import { AtpAgent } from '@atproto/api';
import { AtpBaseClient } from '@/types/generated';

/**
 * Creates a Lanyard API client from an authenticated AtpAgent
 *
 * Note: This function is designed for AtpAgent. For OAuth-based agents,
 * use the ProfileRepository directly which works with both Agent and AtpAgent.
 *
 * @param agent - Authenticated AtpAgent with active session
 * @returns Configured AtpBaseClient ready to make authenticated requests
 * @throws Error if agent has no active session
 *
 * @example
 * ```typescript
 * const agent = new AtpAgent({ service: 'https://bsky.social' });
 * await agent.login({ identifier: 'user', password: 'pass' });
 *
 * const client = createLanyardClient(agent);
 * const result = await client.app.lanyards.actor.biography.identity.get({
 *   repo: agent.session.did,
 *   rkey: 'self'
 * });
 * ```
 */
export function createLanyardClient(agent: AtpAgent): AtpBaseClient {
  if (!agent.session) {
    throw new Error('AtpAgent must have an active session to create client');
  }

  const session = agent.session;

  return new AtpBaseClient({
    service: agent.service.toString(),
    headers: {
      authorization: `Bearer ${session.accessJwt}`,
    },
  });
}

/**
 * Creates a Lanyard API client for unauthenticated read operations
 *
 * @param serviceUrl - AT Protocol service URL (e.g., 'https://bsky.social')
 * @returns AtpBaseClient without authentication
 *
 * @example
 * ```typescript
 * const client = createPublicLanyardClient('https://bsky.social');
 * const identity = await client.app.lanyards.actor.biography.identity.get({
 *   repo: 'did:plc:abc123',
 *   rkey: 'self'
 * });
 * ```
 */
export function createPublicLanyardClient(
  serviceUrl: string = 'https://bsky.social'
): AtpBaseClient {
  return new AtpBaseClient({
    service: serviceUrl,
  });
}
