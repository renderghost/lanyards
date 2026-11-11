import { cdnImage } from '@/lib/atproto/avatar';
import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import type { SifaPosition, SifaProfile } from '@/lib/sources/sifa/sifa.types';

import type { LanyardConfig } from './config';
import { truncateGraphemes } from './format';
import type { BadgeHero } from './personView.types';

const HEADLINE_MAX_GRAPHEMES = 200;

/**
 * The current job (spec §7.1): a position with no end date; the primary one
 * if marked, otherwise the most recently started.
 */
export function currentJob(
  positions: SifaPosition[]
): SifaPosition | undefined {
  const current = positions.filter((position) => !position.endedAt);
  return (
    current.find((position) => position.isPrimary) ??
    [...current].sort((a, b) =>
      (b.startedAt ?? '').localeCompare(a.startedAt ?? '')
    )[0]
  );
}

function bioHeadline(description?: string): string | undefined {
  const first = description?.split(/\n\s*\n/)[0]?.trim();
  return first ? truncateGraphemes(first, HEADLINE_MAX_GRAPHEMES) : undefined;
}

/** The badge at the top of a lanyard; Sifa fields win over Bluesky's. */
export function composeHero(input: {
  bluesky: BlueskyProfile;
  sifa?: SifaProfile | null;
  lanyards?: LanyardRecords;
  config: LanyardConfig;
}): BadgeHero {
  const { bluesky, sifa, lanyards, config } = input;
  const job = config.showJob && sifa ? currentJob(sifa.positions) : undefined;
  const avatar = cdnImage(sifa?.avatar) ?? cdnImage(bluesky.avatar);
  const pronouns = sifa?.pronouns ?? bluesky.pronouns;
  const headline = sifa?.headline ?? bioHeadline(bluesky.description);

  return {
    did: bluesky.did,
    handle: bluesky.handle,
    displayName: sifa?.displayName ?? bluesky.displayName ?? bluesky.handle,
    ...(lanyards?.honorific ? { honorific: lanyards.honorific } : {}),
    ...(avatar ? { avatar } : {}),
    ...(pronouns ? { pronouns } : {}),
    ...(headline ? { headline } : {}),
    ...(job
      ? {
          job: {
            title: job.title,
            ...(job.company ? { company: job.company } : {}),
          },
        }
      : {}),
  };
}
