import { cn } from '@/lib/utils';

import * as styles from './BenefitList.styles';
import type { BenefitListProps } from './BenefitList.types';

/** What researchers get, as numbered rows (#145). */
export function BenefitList({ benefits, className }: BenefitListProps) {
  return (
    <ol className={cn(styles.list, className)}>
      {benefits.map((benefit, index) => (
        <li key={benefit.title} className={styles.item}>
          <span aria-hidden="true" className={styles.number}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className={styles.copy}>
            <h3 className={styles.title}>{benefit.title}</h3>
            <p className={styles.text}>{benefit.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
