import type { Client } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { track } from '@/lib/analytics/analytics';
import {
  canCall,
  canWrite,
  parseGrantedScope,
} from '@/lib/atproto/permissions';
import { createRecord, deleteRecord } from '@/lib/atproto/writes';
import { relationshipQueryOptions } from '@/lib/person/useSharedContext';
import type { Relationship } from '@/lib/sources/bluesky/bluesky.types';

const FOLLOW = 'app.bsky.graph.follow';

export type FollowState = 'unknown' | 'notFollowing' | 'following';

export type UseFollow = {
  state: FollowState;
  pending: boolean;
  /** The session can't write follows; ask for permission first. */
  needsPermission: boolean;
  /** Checking the existing relationship failed, so Follow is unsafe. */
  checkFailed: boolean;
  follow(): void;
  unfollow(): void;
};

/**
 * Follow and unfollow on Bluesky from a lanyard. Never writes without
 * permission, and never follows while the current relationship is unknown,
 * so it can't create a duplicate follow.
 */
export function useFollow(subject: Did, handle: string): UseFollow {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const session = useSession();
  const signedIn = session.status === 'signedIn' ? session.session : null;
  const granted = useMemo(
    () => parseGrantedScope(signedIn?.scope ?? ''),
    [signedIn?.scope]
  );
  const canFollow =
    canWrite(granted, FOLLOW, 'create') && canWrite(granted, FOLLOW, 'delete');
  const canCheck = canCall(granted, 'app.bsky.graph.getRelationships');
  const viewer = (signedIn?.did ?? '') as Did;

  const options = relationshipQueryOptions(
    signedIn?.appview as Client,
    viewer,
    subject
  );
  const relationship = useQuery({
    ...options,
    enabled: Boolean(signedIn) && canCheck && viewer !== subject,
  });
  const [pending, setPending] = useState(false);

  const current = relationship.data;
  const state: FollowState = current
    ? current.followUri
      ? 'following'
      : 'notFollowing'
    : 'unknown';

  const update = (next: Relationship) =>
    queryClient.setQueryData(options.queryKey, next);

  function follow() {
    if (!signedIn || !canFollow || !current || current.followUri || pending) {
      return;
    }
    setPending(true);
    update({ ...current, followUri: 'pending' });
    createRecord(signedIn, FOLLOW, {
      subject,
      createdAt: new Date().toISOString(),
    })
      .then((reference) => {
        update({ ...current, followUri: reference.uri });
        notify.success(t`Followed @${handle}`);
        track('follow_created');
      })
      .catch(() => {
        update(current);
        notify.error(t`Failed to follow. Please try again.`);
      })
      .finally(() => setPending(false));
  }

  function unfollow() {
    const rkey = current?.followUri?.split('/').pop();
    if (!signedIn || !canFollow || !current || !rkey || pending) return;
    setPending(true);
    const { followUri: _removed, ...rest } = current;
    update(rest);
    deleteRecord(signedIn, FOLLOW, rkey)
      .then(() => {
        notify.success(t`Unfollowed @${handle}`);
        track('follow_deleted');
      })
      .catch(() => {
        update(current);
        notify.error(t`Failed to unfollow. Please try again.`);
      })
      .finally(() => setPending(false));
  }

  return {
    state,
    pending,
    needsPermission: Boolean(signedIn) && !(canFollow && canCheck),
    checkFailed: relationship.isError,
    follow,
    unfollow,
  };
}
