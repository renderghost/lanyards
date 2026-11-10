import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './SkillsBlock.styles';
import type { SkillsBlockProps } from './SkillsBlock.types';

/** Skills from Sifa. */
export function SkillsBlock({ items, className }: SkillsBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.chips, className)}>
      {items.map((skill) => (
        <li key={skill.key} className={styles.chip}>
          <ItemFrame
            itemKey={skill.key}
            title={itemTitle('skills', skill, i18n)}
          >
            {skill.name}
          </ItemFrame>
        </li>
      ))}
    </ul>
  );
}
