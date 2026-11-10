import type {} from '@atcute/bluesky';
import { ok } from '@atcute/client';
import type { Did, Handle } from '@atcute/lexicons';

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
 * without a request, for queries shorter than two characters. Rejects on
 * network errors, AppView errors and aborts.
 */
export async function searchHandles(
  query: string,
  signal?: AbortSignal
): Promise<HandleSuggestion[]> {
  const q = query.trim().replace(/^@/, '');
  if (q.length < TYPEAHEAD_MIN_LENGTH) return [];

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
    ...(avatar ? { avatar } : {}),
  }));
}
