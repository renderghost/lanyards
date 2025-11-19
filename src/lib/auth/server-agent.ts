/**
 * Public agent utilities
 *
 * Provides unauthenticated AtpAgent instances for server-side operations
 * that don't require authentication (e.g., viewing public profiles).
 */

import { AtpAgent } from '@atproto/api';

/**
 * Creates a public (unauthenticated) AtpAgent for Bluesky API access
 * Use this for Bluesky-specific operations like getProfile that don't require authentication
 *
 * @returns Unauthenticated AtpAgent for Bluesky API
 */
export function getPublicAgent(): AtpAgent {
  // Use the public Bluesky API endpoint for unauthenticated access to Bluesky data
  return new AtpAgent({
    service: 'https://public.api.bsky.app',
  });
}

/**
 * Creates a public (unauthenticated) AtpAgent for PDS operations
 * Use this for AT Protocol repo operations (listRecords, getRecord) on public data
 *
 * @returns Unauthenticated AtpAgent for PDS operations
 */
export function getPublicPDSAgent(): AtpAgent {
  // Use the main PDS endpoint for AT Protocol repo operations
  return new AtpAgent({
    service: process.env.PDS_URL || 'https://bsky.social',
  });
}
