import { useLingui } from '@lingui/react/macro';

import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { CardLink } from '../CardLink/CardLink';
import { itemTitle } from '../itemTitle';
import { ROLE_LABELS } from './TalksBlock.constants';
import * as styles from './TalksBlock.styles';
import type { TalksBlockProps } from './TalksBlock.types';

/**
 * Talks from Sifa, as cards (#122): a talk with a page opens it from
 * anywhere on its card; one without opens nothing.
 */
export function TalksBlock({ items, className }: TalksBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((talk) => {
        const role = talk.role ? ROLE_LABELS[talk.role] : undefined;
        const meta = [
          talk.date ? formatPartialDate(talk.date) : undefined,
          role ? i18n._(role) : undefined,
        ].filter(Boolean);
        return (
          <li key={talk.key}>
            <CardItem itemKey={talk.key} title={itemTitle('talks', talk, i18n)}>
              {talk.url ? (
                <CardLink href={talk.url} className={styles.title}>
                  {talk.title}
                </CardLink>
              ) : (
                <p className={styles.title}>{talk.title}</p>
              )}
              {talk.eventName && (
                <p className={styles.event}>{talk.eventName}</p>
              )}
              {meta.length > 0 && (
                <p className={styles.meta}>{meta.join(' · ')}</p>
              )}
            </CardItem>
          </li>
        );
      })}
    </ul>
  );
}
