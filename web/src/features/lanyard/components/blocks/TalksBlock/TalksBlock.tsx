import { useLingui } from '@lingui/react/macro';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import { ROLE_LABELS } from './TalksBlock.constants';
import * as styles from './TalksBlock.styles';
import type { TalksBlockProps } from './TalksBlock.types';

/** Talks from Sifa: newest first, with event, date and role. */
export function TalksBlock({ items, className }: TalksBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((talk) => {
        const role = talk.role ? ROLE_LABELS[talk.role] : undefined;
        const meta = [
          talk.eventName,
          talk.date ? formatPartialDate(talk.date) : undefined,
          role ? i18n._(role) : undefined,
        ].filter(Boolean);
        return (
          <li key={talk.key} className={styles.item}>
            <ItemFrame
              itemKey={talk.key}
              title={itemTitle('talks', talk, i18n)}
            >
              {talk.url ? (
                <ExternalLink href={talk.url} className={styles.title}>
                  {talk.title}
                </ExternalLink>
              ) : (
                <p className={styles.title}>{talk.title}</p>
              )}
              {meta.length > 0 && (
                <p className={styles.meta}>{meta.join(' · ')}</p>
              )}
            </ItemFrame>
          </li>
        );
      })}
    </ul>
  );
}
