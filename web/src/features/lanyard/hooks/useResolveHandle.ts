import type { Did } from '@atcute/lexicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { SourceState } from '@/lib/person/personView.types';
import { sourceQueryOptions, toSourceState } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchProfile } from '@/lib/sources/bluesky/bluesky';
import { ok } from '@/lib/sources/result';

/**
 * Resolves a handle to a DID through the Bluesky profile, and seeds the
 * profile query for that DID so the lanyard doesn't fetch it again.
 */
export function useResolveHandle(handle: string): {
  state: SourceState<Did>;
  retry(): void;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['resolveHandle', handle],
    ...sourceQueryOptions(async (signal) => {
      const profile = await fetchProfile(handle, signal);
      if (!profile.ok) return profile;
      queryClient.setQueryData(
        queryKeys.source('bluesky', profile.value.did),
        profile.value
      );
      return ok(profile.value.did);
    }),
  });
  return {
    state: toSourceState(query, true) ?? { status: 'loading' },
    retry: () => {
      void query.refetch();
    },
  };
}
