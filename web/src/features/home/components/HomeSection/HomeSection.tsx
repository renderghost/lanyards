import { useId } from 'react';

import { cn } from '@/lib/utils';

import * as styles from './HomeSection.styles';
import type { HomeSectionProps } from './HomeSection.types';

/** A homepage section: a label, a big heading, an introduction, content. */
export function HomeSection({
  eyebrow,
  heading,
  intro,
  children,
  className,
}: HomeSectionProps) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn(styles.section, className)}>
      <div className={styles.intro}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 id={id} className={styles.heading}>
          {heading}
        </h2>
        {intro && <p className={styles.text}>{intro}</p>}
      </div>
      {children}
    </section>
  );
}
