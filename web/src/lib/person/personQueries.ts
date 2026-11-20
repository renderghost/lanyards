import type { Did } from '@atcute/lexicons';
import { type QueryClient, queryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import { fetchProfile } from '@/lib/sources/bluesky/bluesky';
import {
  fetchLanyardConfig,
  fetchLanyardRecords,
} from '@/lib/sources/lanyards/lanyards';
import { ok } from '@/lib/sources/result';
import { fetchSifaProfile } from '@/lib/sources/sifa/sifa';

import { sourceQueryOptions } from './sourceQuery';

// The reads every lanyard makes, defined once: the page reads them, and
// its routes start them before its code has loaded (#129).

export const profileQuery = (did: Did) =>
  queryOptions({
    queryKey: queryKeys.source('bluesky', did),
    ...sourceQueryOptions('bluesky', (signal) => fetchProfile(did, signal)),
  });

export const sifaQuery = (did: Did) =>
  queryOptions({
    queryKey: queryKeys.source('sifa', did),
    ...sourceQueryOptions('sifa', (signal) => fetchSifaProfile(did, signal)),
  });

/** The owner's kept records: podcasts and videos. */
export const lanyardRecordsQuery = (did: Did) =>
  queryOptions({
    queryKey: queryKeys.source('lanyards', did),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardRecords(did, signal)
    ),
  });

/** The owner's lanyard settings record. */
export const lanyardConfigQuery = (did: Did) =>
  queryOptions({
    queryKey: queryKeys.source('lanyards', did, 'config'),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardConfig(did, signal)
    ),
  });

/**
 * Resolves a handle to a DID through the Bluesky profile, and seeds the
 * profile query for that DID so the lanyard doesn't fetch it again.
 */
export const handleQuery = (queryClient: QueryClient, handle: string) =>
  queryOptions({
    queryKey: ['resolveHandle', handle],
    ...sourceQueryOptions('bluesky', async (signal) => {
      const profile = await fetchProfile(handle, signal);
      if (!profile.ok) return profile;
      queryClient.setQueryData(
        profileQuery(profile.value.did).queryKey,
        profile.value
      );
      return ok(profile.value.did);
    }),
  });

/**
 * Starts the reads a lanyard's badge waits for. Prefetching never fails:
 * the page reads the same queries, and shows their errors itself.
 */
export function prefetchLanyard(queryClient: QueryClient, did: Did): void {
  void queryClient.prefetchQuery(profileQuery(did));
  void queryClient.prefetchQuery(sifaQuery(did));
  void queryClient.prefetchQuery(lanyardRecordsQuery(did));
  void queryClient.prefetchQuery(lanyardConfigQuery(did));
}

/** Resolves the handle, then prefetches the lanyard of the DID it names. */
export function prefetchHandleLanyard(
  queryClient: QueryClient,
  handle: string
): void {
  const query = handleQuery(queryClient, handle);
  void queryClient.prefetchQuery(query).then(() => {
    const did = queryClient.getQueryData(query.queryKey);
    if (did) prefetchLanyard(queryClient, did);
  });
}
