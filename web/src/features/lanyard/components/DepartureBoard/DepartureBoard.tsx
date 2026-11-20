import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { ArrowDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { OPEN_TO_LABELS } from '../blocks/OpenToBlock/OpenToBlock.constants';
import { OPEN_TO_SHOWN } from './DepartureBoard.constants';
import * as styles from './DepartureBoard.styles';
import type { DepartureBoardProps } from './DepartureBoard.types';

/**
 * The badge's departure board (spec §7): the main role, where they're
 * based and what they're open to. Each cell shows only with a value; with
 * none, the board isn't there at all.
 */
export function DepartureBoard({
  role,
  location,
  openTo,
  rolesHref,
  className,
}: DepartureBoardProps) {
  const { t, i18n } = useLingui();
  if (!role && !location && openTo.length === 0) return null;

  const shown = openTo.slice(0, OPEN_TO_SHOWN);
  const rest = openTo.length - shown.length;

  return (
    <dl className={cn(styles.board, className)}>
      {role && (
        <div className={styles.cells.now}>
          <dt className={styles.label}>{t`Now`}</dt>
          <dd className={styles.value}>
            {[role.title, role.company].filter(Boolean).join(' · ')}
            {rolesHref && role.others > 0 && (
              <a href={rolesHref} className={styles.more}>
                {plural(role.others, {
                  one: '+# more role',
                  other: '+# more roles',
                })}
                <ArrowDown aria-hidden="true" className={styles.arrow} />
              </a>
            )}
          </dd>
        </div>
      )}
      {location && (
        <div className={styles.cells.based}>
          <dt className={styles.label}>{t`Based`}</dt>
          <dd className={styles.value}>{location}</dd>
        </div>
      )}
      {openTo.length > 0 && (
        <div className={styles.cells.openTo}>
          <dt className={styles.label}>{t`Open to`}</dt>
          <dd className={styles.value}>
            {shown.map((value) => i18n._(OPEN_TO_LABELS[value])).join(' · ')}
            {rest > 0 && ` +${rest}`}
          </dd>
        </div>
      )}
    </dl>
  );
}
