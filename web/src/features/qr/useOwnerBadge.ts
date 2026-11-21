import type { Did } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { Accent } from '@/design/accents';
import { useProfile } from '@/lib/atproto/useProfile';
import { resolveConfig } from '@/lib/person/config';
import { composeHero } from '@/lib/person/hero';
import {
  lanyardConfigQuery,
  profileQuery,
  sifaQuery,
} from '@/lib/person/personQueries';
import type { BadgeHero } from '@/lib/person/personView.types';
import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';

/**
 * The owner's badge for the Share sheet (spec §8), read as the lanyard
 * reads it, through the same queries. While they load, or when they fail,
 * it falls back: Sifa to Bluesky; Bluesky to the account's own profile
 * (which the app header has usually read already); then no badge at all.
 * The accent is the default until the owner's record is read.
 */
export function useOwnerBadge(did: Did): {
  hero: BadgeHero | null;
  accent: Accent;
} {
  const profile = useQuery(profileQuery(did));
  const sifa = useQuery(sifaQuery(did));
  const configQuery = useQuery(lanyardConfigQuery(did));
  const account = useProfile(did);

  const config = useMemo(
    () => resolveConfig(configQuery.data?.value ?? null),
    [configQuery.data]
  );
  const bluesky: BlueskyProfile | undefined =
    profile.data ??
    (account.data
      ? {
          did: account.data.did,
          handle: account.data.handle,
          ...(account.data.displayName
            ? { displayName: account.data.displayName }
            : {}),
          ...(account.data.avatar ? { avatar: account.data.avatar } : {}),
          links: [],
          labels: [],
        }
      : undefined);

  return {
    hero: bluesky ? composeHero({ bluesky, sifa: sifa.data, config }) : null,
    accent: config.accent,
  };
}
