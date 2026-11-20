import { cn } from '@/lib/utils';

import * as styles from './HomeBoard.styles';
import type { HomeBoardProps } from './HomeBoard.types';

/** Problems, listed like departures on the badge's ink board (#145). */
export function HomeBoard({ rows, className }: HomeBoardProps) {
  return (
    <ol className={cn(styles.board, className)}>
      {rows.map((row, index) => (
        <li key={row.title} className={styles.row}>
          <span aria-hidden="true" className={styles.number}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.title}>{row.title}</h3>
          <p className={styles.text}>{row.text}</p>
        </li>
      ))}
    </ol>
  );
}
