import type { Did } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { queryKeys } from '@/lib/query/keys';
import { fetchPosts } from '@/lib/sources/bluesky/bluesky';
import {
  fetchOrcidVerified,
  fetchOrcidWorks,
  findOrcidId,
} from '@/lib/sources/orcid/orcid';
import { fetchCollections } from '@/lib/sources/semble/semble';
import { fetchBlogPosts } from '@/lib/sources/standardSite/standardSite';
import { fetchRepos } from '@/lib/sources/tangled/tangled';

import {
  composeBlocks,
  composeEditorBlocks,
  orphanedHiddenKeys,
} from './blocks';
import { type RenderableBlockType, resolveConfig } from './config';
import { composeHero } from './hero';
import {
  lanyardConfigQuery,
  lanyardRecordsQuery,
  profileQuery,
  sifaQuery,
} from './personQueries';
import type {
  PersonViewState,
  SourceKey,
  SourceSnapshot,
} from './personView.types';
import { sourceQueryOptions, toSourceState } from './sourceQuery';

/** List sources fetch this many items; blocks then hide and limit them. */
const FETCH_LIMIT = 20;

/**
 * How long the hero waits, after Bluesky answers, for Sifa and the owner's
 * record (spec §7): long enough not to flash the default accent and cover,
 * never long enough to hold the page up.
 */
export const HERO_WAIT_MS = 800;

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

  const profile = useQuery(profileQuery(did));
  const sifa = useQuery(sifaQuery(did));
  const lanyards = useQuery(lanyardRecordsQuery(did));
  // The owner's choices are read on their own: if they can't be read, no
  // blocks show at all, rather than the defaults undoing what they hid.
  const configQuery = useQuery(lanyardConfigQuery(did));

  const configReady = configQuery.status !== 'pending';
  const configError = configQuery.status === 'error';
  // Settings once read stay usable when a later refetch fails: the error
  // is shown beside them, never instead of them.
  const configUsable = configQuery.data !== undefined;
  const config = useMemo(
    () => resolveConfig(configQuery.data?.value ?? null),
    [configQuery.data]
  );
  const visible = new Set<RenderableBlockType>(
    configUsable
      ? config.blocks.filter((block) => block.visible).map((b) => b.type)
      : []
  );
  // The hero waits for Sifa and the record to settle (answered or failed),
  // for at most HERO_WAIT_MS after Bluesky answers. Once settled it stays
  // so: a refetch of a failed source puts its status back to pending, but
  // never takes the page back to the skeleton (isFetched stays true).
  const profileReady = profile.status === 'success';
  const heroSettled = sifa.isFetched && configQuery.isFetched;
  const [waitedFor, setWaitedFor] = useState<Did | null>(null);
  useEffect(() => {
    if (!profileReady || heroSettled) return;
    const timer = setTimeout(() => setWaitedFor(did), HERO_WAIT_MS);
    return () => clearTimeout(timer);
  }, [did, profileReady, heroSettled]);
  const heroReady = profileReady && (heroSettled || waitedFor === did);

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
          config,
        })
      : undefined,
    heroReady,
    sifaPending: !sifa.isFetched,
    blocks: configUsable
      ? composeBlocks({ config, sources, mode, orcidVerified })
      : [],
    editorBlocks:
      configUsable && mode === 'owner'
        ? composeEditorBlocks({ config, sources, orcidVerified })
        : [],
    orphanedHidden:
      configUsable && mode === 'owner'
        ? orphanedHiddenKeys({ config, sources, orcidVerified })
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
