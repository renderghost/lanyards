/**
 * Public agent utilities
 *
 * Provides unauthenticated AtpAgent instances for server-side operations
 * that don't require authentication (e.g., viewing public profiles).
 */

import { AtpAgent } from '@atproto/api';

/**
 * Creates a public (unauthenticated) AtpAgent
 * Use this for operations that don't require authentication
 *
 * @returns Unauthenticated AtpAgent
 */
export function getPublicAgent(): AtpAgent {
  return new AtpAgent({
    service: process.env.PDS_URL || 'https://bsky.social',
  });
}
