import { coverFor, initialsOf } from '@/design/covers';
import { cdnImage } from '@/lib/atproto/avatar';
import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';
import type { SifaPosition, SifaProfile } from '@/lib/sources/sifa/sifa.types';

import { openToKey } from './blocks';
import type { LanyardConfig } from './config';
import { truncateGraphemes } from './format';
import type { BadgeHero, BadgeRole } from './personView.types';

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

/**
 * The main current role (spec §7): the current job among the positions the
 * owner hasn't hidden, and how many other visible current positions there
 * are. A hidden role never appears on the badge.
 */
function mainRole(
  positions: SifaPosition[],
  hidden: ReadonlySet<string>
): BadgeRole | undefined {
  const visible = positions.filter((position) => !hidden.has(position.key));
  const job = currentJob(visible);
  if (!job) return undefined;
  const current = visible.filter((position) => !position.endedAt).length;
  return {
    title: job.title,
    ...(job.company ? { company: job.company } : {}),
    others: current - 1,
  };
}

/** The badge at the top of a lanyard; Sifa fields win over Bluesky's. */
export function composeHero(input: {
  bluesky: BlueskyProfile;
  sifa?: SifaProfile | null;
  config: LanyardConfig;
}): BadgeHero {
  const { bluesky, sifa, config } = input;
  const hidden = new Set(config.hidden);
  const honorifics = sifa?.showHonorifics ? sifa : undefined;
  const role =
    config.showRole && sifa ? mainRole(sifa.positions, hidden) : undefined;
  const location = config.showLocation ? sifa?.location : undefined;
  const openTo = config.showOpenTo
    ? (sifa?.openTo ?? []).filter((value) => !hidden.has(openToKey(value)))
    : [];
  const avatar = cdnImage(sifa?.avatar) ?? cdnImage(bluesky.avatar);
  const pronouns = sifa?.pronouns ?? bluesky.pronouns;
  const headline = sifa?.headline ?? bioHeadline(bluesky.description);
  const displayName =
    sifa?.displayName ?? bluesky.displayName ?? bluesky.handle;

  return {
    did: bluesky.did,
    handle: bluesky.handle,
    displayName,
    ...(honorifics?.honorificPrefix
      ? { honorificPrefix: honorifics.honorificPrefix }
      : {}),
    ...(honorifics?.honorificSuffix
      ? { honorificSuffix: honorifics.honorificSuffix }
      : {}),
    ...(avatar ? { avatar } : {}),
    ...(pronouns ? { pronouns } : {}),
    ...(headline ? { headline } : {}),
    cover: config.cover ?? coverFor(bluesky.did),
    initials: initialsOf(displayName),
    ...(role ? { role } : {}),
    ...(location ? { location } : {}),
    openTo,
  };
}

/**
 * The badge's name with its honorifics, as Sifa holds them: the prefix
 * before the name and the suffix after a comma ("Dr Ada Example, PhD").
 */
export function heroName(
  hero: Pick<BadgeHero, 'displayName' | 'honorificPrefix' | 'honorificSuffix'>
): string {
  const name = [hero.honorificPrefix, hero.displayName]
    .filter(Boolean)
    .join(' ');
  return hero.honorificSuffix ? `${name}, ${hero.honorificSuffix}` : name;
}
