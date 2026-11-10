import { cn } from '@/lib/utils';

import * as styles from './SkillsBlock.styles';
import type { SkillsBlockProps } from './SkillsBlock.types';

/** Skills from Sifa. */
export function SkillsBlock({ items, className }: SkillsBlockProps) {
  return (
    <ul className={cn(styles.chips, className)}>
      {items.map((skill) => (
        <li key={skill.key} className={styles.chip}>
          {skill.name}
        </li>
      ))}
    </ul>
  );
}
