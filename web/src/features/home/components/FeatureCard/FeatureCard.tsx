import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { cn } from '@/lib/utils';

import * as styles from './FeatureCard.styles';
import type { FeatureCardProps } from './FeatureCard.types';

/** One feature, as a block with a cover, in its own accent (#145). */
export function FeatureCard({
  title,
  text,
  icon: Icon,
  accent,
  cover,
  initials = '',
  className,
}: FeatureCardProps) {
  return (
    <div data-accent={accent} className={cn(styles.card, className)}>
      <div className={styles.cover}>
        <CoverPattern pattern={cover} initials={initials} />
      </div>
      <div className={styles.body}>
        <div className={styles.tileBox}>
          <span className={styles.tile}>
            <Icon aria-hidden="true" className={styles.icon} />
          </span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{text}</p>
      </div>
    </div>
  );
}
