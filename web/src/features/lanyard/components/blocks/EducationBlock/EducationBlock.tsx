import { useLingui } from '@lingui/react/macro';

import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import { CardItem } from '../CardItem/CardItem';
import { itemTitle } from '../itemTitle';
import * as styles from './EducationBlock.styles';
import type { EducationBlockProps } from './EducationBlock.types';

/** Education from Sifa, as cards that open nothing (#122). */
export function EducationBlock({ items, className }: EducationBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.list, className)}>
      {items.map((entry) => {
        const course = [entry.degree, entry.fieldOfStudy]
          .filter(Boolean)
          .join(', ');
        const years = [entry.startedAt, entry.endedAt]
          .filter((value): value is string => Boolean(value))
          .map(formatPartialDate)
          .join('–');
        const meta = [course, years].filter(Boolean).join(' · ');
        return (
          <li key={entry.key}>
            <CardItem
              itemKey={entry.key}
              title={itemTitle('education', entry, i18n)}
            >
              <p className={styles.title}>{entry.institution}</p>
              {meta && <p className={styles.meta}>{meta}</p>}
            </CardItem>
          </li>
        );
      })}
    </ul>
  );
}
