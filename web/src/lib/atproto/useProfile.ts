import type {} from '@atcute/bluesky';
import { ok } from '@atcute/client';
import type { ActorIdentifier, Did, Handle } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';

import { avatarThumbnail } from './avatar';
import { publicAppView } from './identity';

export type ProfileSummary = {
  did: Did;
  handle: Handle;
  displayName?: string;
  avatar?: string;
};

const PROFILE_STALE_MS = 5 * 60 * 1000;

/** Public Bluesky profile for an actor (DID or handle). */
export function useProfile(actor: string | undefined) {
  return useQuery({
    queryKey: ['profile', actor],
    enabled: Boolean(actor),
    staleTime: PROFILE_STALE_MS,
    queryFn: async ({ signal }): Promise<ProfileSummary> => {
      const profile = await ok(
        publicAppView.get('app.bsky.actor.getProfile', {
          params: { actor: actor as ActorIdentifier },
          signal,
        })
      );
      return {
        did: profile.did,
        handle: profile.handle,
        ...(profile.displayName ? { displayName: profile.displayName } : {}),
        ...(profile.avatar ? { avatar: avatarThumbnail(profile.avatar) } : {}),
      };
    },
  });
}
