import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { itemTitle } from '../itemTitle';
import { PillItem } from '../PillItem/PillItem';
import { OPEN_TO_LABELS } from './OpenToBlock.constants';
import * as styles from './OpenToBlock.styles';
import type { OpenToBlockProps } from './OpenToBlock.types';

/** What the person is open to, from Sifa, as pills (#122). */
export function OpenToBlock({ items, className }: OpenToBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.pills, className)}>
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <PillItem
            itemKey={item.key}
            title={itemTitle('openTo', item, i18n)}
            label={i18n._(OPEN_TO_LABELS[item.value])}
          />
        </li>
      ))}
    </ul>
  );
}
