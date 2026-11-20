import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { itemTitle } from '../itemTitle';
import { PillItem } from '../PillItem/PillItem';
import * as styles from './SkillsBlock.styles';
import type { SkillsBlockProps } from './SkillsBlock.types';

/** Skills from Sifa, as pills (#122). */
export function SkillsBlock({ items, className }: SkillsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.pills, className)}>
      {items.map((skill) => (
        <li key={skill.key} className={styles.item}>
          <PillItem
            itemKey={skill.key}
            title={itemTitle('skills', skill, i18n)}
            label={skill.name}
            className={styles.chip}
          />
        </li>
      ))}
    </ul>
  );
}
