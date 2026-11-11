import type { Did } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { Client } from '@atcute/client';

import { useSession } from '@/features/auth/session/useSession';
import { canCall, parseGrantedScope } from '@/lib/atproto/permissions';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchKnownFollowers,
  fetchRelationship,
} from '@/lib/sources/bluesky/bluesky';
import type {
  KnownFollowers,
  Relationship,
} from '@/lib/sources/bluesky/bluesky.types';

import { sourceQueryOptions } from './sourceQuery';

/** The viewer's relationship to `subject`; shared by everything that needs it. */
export function relationshipQueryOptions(
  appview: Client,
  viewer: Did,
  subject: Did
) {
  return {
    queryKey: queryKeys.relationship(viewer, subject),
    ...sourceQueryOptions('bluesky', (signal) =>
      fetchRelationship(appview, viewer, subject, signal)
    ),
  };
}

export type SharedContext = {
  mutual: boolean;
  knownFollowers?: KnownFollowers;
  relationship?: Relationship;
  loading: boolean;
  /**
   * Still finding out whether either person blocks the other. The lanyard
   * waits for this, so a blocked viewer never glimpses it. Sessions that
   * can't read relationships (identity-only) skip the check, like signed-out
   * visitors, because the lanyard is public.
   */
  checkingBlock: boolean;
};

/**
 * What the signed-in viewer and the subject share (spec §7.3). Computed
 * from the viewer's AppView reads; never stored.
 */
export function useSharedContext(did: Did): SharedContext {
  const session = useSession();
  const signedIn = session.status === 'signedIn' ? session.session : null;
  const viewer = signedIn?.did;
  const granted = useMemo(
    () => parseGrantedScope(signedIn?.scope ?? ''),
    [signedIn?.scope]
  );
  const someoneElse = Boolean(signedIn) && viewer !== did;

  const relationshipEnabled =
    someoneElse && canCall(granted, 'app.bsky.graph.getRelationships');
  const followersEnabled =
    someoneElse && canCall(granted, 'app.bsky.graph.getKnownFollowers');

  const relationship = useQuery({
    ...relationshipQueryOptions(
      signedIn?.appview as Client,
      (viewer ?? '') as Did,
      did
    ),
    enabled: relationshipEnabled,
  });
  const followers = useQuery({
    queryKey: queryKeys.knownFollowers(viewer ?? '', did),
    enabled: followersEnabled,
    ...sourceQueryOptions('bluesky', (signal) =>
      fetchKnownFollowers(signedIn!.appview, did, signal)
    ),
  });

  const loading =
    (relationshipEnabled && relationship.isPending) ||
    (followersEnabled && followers.isPending);

  return {
    checkingBlock: relationshipEnabled && relationship.isPending,
    mutual: Boolean(
      relationship.data?.followUri && relationship.data.followedBy
    ),
    ...(followers.data ? { knownFollowers: followers.data } : {}),
    ...(relationship.data ? { relationship: relationship.data } : {}),
    loading,
  };
}
