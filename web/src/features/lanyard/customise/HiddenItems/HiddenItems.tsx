import { useLingui } from '@lingui/react/macro';
import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/Button/Button';
import { itemTitle } from '@/features/lanyard/components/blocks/itemTitle';
import { BLOCK_HEADINGS } from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';
import type { HiddenItem } from '@/lib/person/blocks';
import { cn } from '@/lib/utils';

import * as styles from './HiddenItems.styles';
import type { HiddenItemsProps } from './HiddenItems.types';

/**
 * Items the owner hid from their lanyard, each with Show again. Focus
 * never drops to the page: showing an item moves it to the next entry,
 * the previous one, or the empty list's message.
 */
export function HiddenItems({
  items,
  onShow,
  disabled = false,
  focusKey,
  onFocused,
  className,
}: HiddenItemsProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const empty = useRef<HTMLParagraphElement>(null);
  /** Where the entry just shown again sat, to focus its neighbour. */
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (shownAt.current === null) return;
    const at = shownAt.current;
    shownAt.current = null;
    const next = items[at] ?? items[at - 1];
    if (next) buttons.current.get(next.key)?.focus();
    else empty.current?.focus();
  }, [items]);

  // A newly hidden item's entry takes focus from the menu that hid it.
  useEffect(() => {
    if (!focusKey) return;
    const button = buttons.current.get(focusKey);
    if (!button) return;
    button.focus();
    onFocused?.();
  }, [focusKey, items, onFocused]);

  const titleOf = (entry: HiddenItem): string => {
    if ('item' in entry) {
      return itemTitle(entry.type, entry.item as never, i18n);
    }
    if (!entry.type) return t`An item that is no longer available`;
    const block = i18n._(BLOCK_HEADINGS[entry.type]);
    switch (entry.reason) {
      case 'off':
        return t`An item in ${block}, which is switched off`;
      case 'failed':
        return t`An item in ${block}, which didn't load`;
      case 'loading':
        return t`An item in ${block}, still loading`;
      case 'gone':
        return t`An item in ${block} that is no longer available`;
    }
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(styles.section, className)}
    >
      <h2 id={headingId} className={styles.heading}>
        {t`Hidden items`}
      </h2>
      {items.length === 0 ? (
        <p ref={empty} tabIndex={-1} className={styles.empty}>
          {t`No items are hidden.`}
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((entry, index) => {
            const titleId = `${headingId}-${index}`;
            return (
              <li key={entry.key} className={styles.entry}>
                <span id={titleId} className={styles.title}>
                  {titleOf(entry)}
                </span>
                <Button
                  ref={(button) => {
                    if (button) buttons.current.set(entry.key, button);
                    else buttons.current.delete(entry.key);
                  }}
                  variant="ghost"
                  aria-describedby={titleId}
                  disabled={disabled}
                  onClick={() => {
                    shownAt.current = index;
                    onShow(entry.key);
                  }}
                >
                  {t`Show again`}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
