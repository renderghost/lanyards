import { formatPartialDate } from '@/lib/person/format';
import { cn } from '@/lib/utils';

import * as styles from './EducationBlock.styles';
import type { EducationBlockProps } from './EducationBlock.types';

/** Education from Sifa. */
export function EducationBlock({ items, className }: EducationBlockProps) {
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
          <li key={entry.key} className={styles.item}>
            <p className={styles.title}>{entry.institution}</p>
            {meta && <p className={styles.meta}>{meta}</p>}
          </li>
        );
      })}
    </ul>
  );
}
