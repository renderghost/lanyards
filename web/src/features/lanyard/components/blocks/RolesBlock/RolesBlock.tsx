import { useLingui } from '@lingui/react/macro';

import { formatPartialDate } from '@/lib/person/format';
import type { SifaPosition } from '@/lib/sources/sifa/sifa.types';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import { NO_COMPANY } from './RolesBlock.constants';
import * as styles from './RolesBlock.styles';
import type { RolesBlockProps } from './RolesBlock.types';

const graphemes = new Intl.Segmenter('en-GB', { granularity: 'grapheme' });

/** The company's first character, for the role's monogram tile. */
function initialOf(company: string | undefined): string {
  const first = company?.trim()
    ? graphemes.segment(company.trim())[Symbol.iterator]().next().value
    : undefined;
  return first ? first.segment.toLocaleUpperCase('en-GB') : NO_COMPANY;
}

/**
 * Every role from Sifa (spec §9), current ones first, marked Now: a row
 * each, with the company's initial, the title, the company and the dates.
 */
export function RolesBlock({ items, className }: RolesBlockProps) {
  const { t, i18n } = useLingui();

  const dates = (role: SifaPosition): string | undefined => {
    const start = role.startedAt && formatPartialDate(role.startedAt);
    const end = role.endedAt && formatPartialDate(role.endedAt);
    if (start && end) return `${start} – ${end}`;
    if (start) return t`${start} – now`;
    return end || undefined;
  };

  return (
    <ul className={cn(styles.list, className)}>
      {items.map((role) => {
        const when = dates(role);
        return (
          <li key={role.key} className={styles.item}>
            <ItemFrame
              itemKey={role.key}
              title={itemTitle('roles', role, i18n)}
            >
              <div className={styles.row}>
                <span className={styles.tile} aria-hidden="true">
                  {initialOf(role.company)}
                </span>
                <div className={styles.text}>
                  <p className={styles.title}>{role.title}</p>
                  {role.company && (
                    <p className={styles.company}>{role.company}</p>
                  )}
                </div>
                <div className={styles.aside}>
                  {!role.endedAt && (
                    <span className={styles.now}>{t`Now`}</span>
                  )}
                  {when && <span className={styles.dates}>{when}</span>}
                </div>
              </div>
            </ItemFrame>
          </li>
        );
      })}
    </ul>
  );
}
