import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { itemTitle } from '@/features/lanyard/components/blocks/itemTitle';
import type { HiddenItem } from '@/lib/person/blocks';
import { cn } from '@/lib/utils';

import * as styles from './HiddenItems.styles';
import type { HiddenItemsProps } from './HiddenItems.types';

/** Items the owner hid from their lanyard, each with Show again. */
export function HiddenItems({
  items,
  onShow,
  disabled = false,
  className,
}: HiddenItemsProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  if (items.length === 0) return null;

  const titleOf = (entry: HiddenItem) =>
    'item' in entry
      ? itemTitle(entry.type, entry.item as never, i18n)
      : t`An item that is no longer available`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(styles.section, className)}
    >
      <h3 id={headingId} className={styles.heading}>
        {t`Hidden items`}
      </h3>
      <ul className={styles.list}>
        {items.map((entry, index) => {
          const titleId = `${headingId}-${index}`;
          return (
            <li key={entry.key} className={styles.entry}>
              <span id={titleId} className={styles.title}>
                {titleOf(entry)}
              </span>
              <Button
                variant="ghost"
                aria-describedby={titleId}
                disabled={disabled}
                onClick={() => onShow(entry.key)}
              >
                {t`Show again`}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
