import type { Did } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { queryKeys } from '@/lib/query/keys';
import { fetchPosts, fetchProfile } from '@/lib/sources/bluesky/bluesky';
import {
  fetchLanyardConfig,
  fetchLanyardRecords,
} from '@/lib/sources/lanyards/lanyards';
import {
  fetchOrcidVerified,
  fetchOrcidWorks,
  findOrcidId,
} from '@/lib/sources/orcid/orcid';
import { fetchCollections } from '@/lib/sources/semble/semble';
import { fetchSifaProfile } from '@/lib/sources/sifa/sifa';
import { fetchBlogPosts } from '@/lib/sources/standardSite/standardSite';
import { fetchRepos } from '@/lib/sources/tangled/tangled';

import {
  blockStatuses,
  composeBlocks,
  hiddenItems as findHiddenItems,
} from './blocks';
import { type RenderableBlockType, resolveConfig } from './config';
import { composeHero } from './hero';
import type {
  PersonViewState,
  SourceKey,
  SourceSnapshot,
} from './personView.types';
import { sourceQueryOptions, toSourceState } from './sourceQuery';

/** List sources fetch this many items; blocks then hide and limit them. */
const FETCH_LIMIT = 20;

/**
 * Everything a lanyard shows, loaded progressively: one query per source,
 * and only the sources the owner's visible blocks need (spec §12.3).
 * `mode` overrides who it is shown to, for the customiser's preview.
 */
export function usePersonView(
  did: Did,
  options: { mode?: 'owner' | 'visitor' } = {}
): PersonViewState {
  const session = useSession();
  const viewer = session.status === 'signedIn' ? session.session.did : null;
  const mode = options.mode ?? (viewer === did ? 'owner' : 'visitor');

  const profile = useQuery({
    queryKey: queryKeys.source('bluesky', did),
    ...sourceQueryOptions('bluesky', (signal) => fetchProfile(did, signal)),
  });
  const sifa = useQuery({
    queryKey: queryKeys.source('sifa', did),
    ...sourceQueryOptions('sifa', (signal) => fetchSifaProfile(did, signal)),
  });
  const lanyards = useQuery({
    queryKey: queryKeys.source('lanyards', did),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardRecords(did, signal)
    ),
  });
  // The owner's choices are read on their own: if they can't be read, no
  // blocks show at all, rather than the defaults undoing what they hid.
  const configQuery = useQuery({
    queryKey: queryKeys.source('lanyards', did, 'config'),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardConfig(did, signal)
    ),
  });

  const configReady = configQuery.status !== 'pending';
  const configError = configQuery.status === 'error';
  const config = useMemo(
    () => resolveConfig(configQuery.data?.value ?? null),
    [configQuery.data]
  );
  const visible = new Set<RenderableBlockType>(
    configReady && !configError
      ? config.blocks.filter((block) => block.visible).map((b) => b.type)
      : []
  );
  const handle = profile.data?.handle;
  const orcidId = sifa.data
    ? findOrcidId(sifa.data.externalAccounts)
    : undefined;

  const enabled = {
    blueskyPosts: visible.has('bskyPosts'),
    standardSite: visible.has('blogPosts'),
    tangled: visible.has('code') && Boolean(handle),
    semble: visible.has('collections') && Boolean(handle),
    orcid: visible.has('publications') && Boolean(orcidId),
  };

  const posts = useQuery({
    queryKey: queryKeys.source('blueskyPosts', did),
    enabled: enabled.blueskyPosts,
    ...sourceQueryOptions('bluesky', (signal) =>
      fetchPosts(did, FETCH_LIMIT, signal)
    ),
  });
  const blogPosts = useQuery({
    queryKey: queryKeys.source('standardSite', did),
    enabled: enabled.standardSite,
    ...sourceQueryOptions('standardSite', (signal) =>
      fetchBlogPosts(did, FETCH_LIMIT, signal)
    ),
  });
  const repos = useQuery({
    queryKey: queryKeys.source('tangled', did, handle ?? ''),
    enabled: enabled.tangled,
    ...sourceQueryOptions('tangled', (signal) =>
      fetchRepos(did, handle ?? '', FETCH_LIMIT, signal)
    ),
  });
  const collections = useQuery({
    queryKey: queryKeys.source('semble', did, handle ?? ''),
    enabled: enabled.semble,
    ...sourceQueryOptions('semble', (signal) =>
      fetchCollections(did, handle ?? '', FETCH_LIMIT, signal)
    ),
  });
  const works = useQuery({
    queryKey: queryKeys.source('orcidWorks', did, orcidId ?? ''),
    enabled: enabled.orcid,
    ...sourceQueryOptions('orcid', (signal) =>
      fetchOrcidWorks(orcidId ?? '', signal)
    ),
  });
  const verified = useQuery({
    queryKey: queryKeys.source('orcid', did, orcidId ?? ''),
    enabled: enabled.orcid,
    ...sourceQueryOptions('orcid', (signal) =>
      fetchOrcidVerified(orcidId ?? '', did, signal)
    ),
  });

  const sources: SourceSnapshot = {
    bluesky: toSourceState(profile, true),
    sifa: toSourceState(sifa, true),
    lanyards: toSourceState(lanyards, true),
    blueskyPosts: toSourceState(posts, enabled.blueskyPosts),
    standardSite: toSourceState(blogPosts, enabled.standardSite),
    tangled: toSourceState(repos, enabled.tangled),
    semble: toSourceState(collections, enabled.semble),
    orcidWorks: toSourceState(works, enabled.orcid),
  };

  const configUsable = configReady && !configError;
  const orcidVerified = verified.data === true;

  const queries: Record<SourceKey, { refetch: () => unknown }> = {
    bluesky: profile,
    sifa,
    lanyards,
    blueskyPosts: posts,
    standardSite: blogPosts,
    tangled: repos,
    semble: collections,
    orcidWorks: works,
    orcid: verified,
  };

  return {
    profile: toSourceState(profile, true) ?? { status: 'loading' },
    hero: profile.data
      ? composeHero({
          bluesky: profile.data,
          sifa: sifa.data,
          lanyards: lanyards.data,
          config,
        })
      : undefined,
    blocks: configUsable
      ? composeBlocks({ config, sources, mode, orcidVerified })
      : [],
    statuses: configUsable
      ? blockStatuses({ config, sources, orcidVerified })
      : {},
    hiddenItems: configUsable
      ? findHiddenItems({ config, sources, orcidVerified })
      : [],
    orcidId: sifa.status === 'success' ? (orcidId ?? null) : undefined,
    config,
    configReady,
    configError,
    mode,
    retry: async (source) => {
      await Promise.all([
        queries[source].refetch(),
        ...(source === 'lanyards' ? [configQuery.refetch()] : []),
      ]);
    },
  };
}
