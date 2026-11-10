import type {} from '@atcute/bluesky';
import { ok } from '@atcute/client';
import type { Did, Handle } from '@atcute/lexicons';

import { avatarThumbnail } from './avatar';
import { publicAppView } from './identity';

export type HandleSuggestion = {
  did: Did;
  handle: Handle;
  displayName?: string;
  avatar?: string;
};

export const TYPEAHEAD_LIMIT = 8;
export const TYPEAHEAD_MIN_LENGTH = 2;

/**
 * Suggests accounts for a partially typed handle. Resolves to an empty list,
 * without a request, for queries shorter than two characters and for
 * anything that looks like an email address or a DID. Rejects on
 * network errors, AppView errors and aborts.
 */
export async function searchHandles(
  query: string,
  signal?: AbortSignal
): Promise<HandleSuggestion[]> {
  const q = query.trim().replace(/^@/, '');
  if (q.length < TYPEAHEAD_MIN_LENGTH) return [];
  // Never send an email address or a DID to a third-party search.
  if (q.includes('@') || q.startsWith('did:')) return [];

  const data = await ok(
    publicAppView.get('app.bsky.actor.searchActorsTypeahead', {
      params: { q, limit: TYPEAHEAD_LIMIT },
      signal,
    })
  );

  return data.actors.map(({ did, handle, displayName, avatar }) => ({
    did,
    handle,
    ...(displayName ? { displayName } : {}),
    ...(avatar ? { avatar: avatarThumbnail(avatar) } : {}),
  }));
}
