import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { OPEN_TO_LABELS } from './OpenToBlock.constants';
import * as styles from './OpenToBlock.styles';
import type { OpenToBlockProps } from './OpenToBlock.types';

/** What the person is open to, from Sifa. */
export function OpenToBlock({ items, className }: OpenToBlockProps) {
  const { i18n } = useLingui();
  return (
    <ul className={cn(styles.chips, className)}>
      {items.map((item) => (
        <li key={item.key} className={styles.chip}>
          {i18n._(OPEN_TO_LABELS[item.value])}
        </li>
      ))}
    </ul>
  );
}
