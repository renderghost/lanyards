import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import * as styles from './SharedContextStrip.styles';
import type { SharedContextStripProps } from './SharedContextStrip.types';

/**
 * What the signed-in viewer shares with the person (spec §7.3). Computed
 * by Lanyards, never stored, and not controlled by the owner.
 */
export function SharedContextStrip({
  mutual,
  knownFollowers,
  className,
}: SharedContextStripProps) {
  const { t } = useLingui();
  const names = (knownFollowers?.sample ?? []).map(
    (person) => person.displayName ?? person.handle
  );
  const others = (knownFollowers?.count ?? 0) - names.length;
  const [first, second] = names;

  let followedBy: string | undefined;
  if (first && others > 0 && knownFollowers?.more) {
    followedBy = second
      ? t`Followed by ${first}, ${second} and ${others}+ others you follow`
      : t`Followed by ${first} and ${others}+ others you follow`;
  } else if (first && others > 0) {
    const rest = plural(others, { one: '# other', other: '# others' });
    followedBy = second
      ? t`Followed by ${first}, ${second} and ${rest} you follow`
      : t`Followed by ${first} and ${rest} you follow`;
  } else if (first) {
    followedBy = second
      ? t`Followed by ${first} and ${second}, who you follow`
      : t`Followed by ${first}, who you follow`;
  }

  if (!mutual && !followedBy) return null;
  return (
    <ul className={cn(styles.strip, className)} aria-label={t`What you share`}>
      {mutual && <li className={styles.item}>{t`You follow each other`}</li>}
      {followedBy && <li className={styles.item}>{followedBy}</li>}
    </ul>
  );
}
