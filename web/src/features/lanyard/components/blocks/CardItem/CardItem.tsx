import { useLingui } from '@lingui/react/macro';
import { use, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './CardItem.styles';
import type { CardItemProps } from './CardItem.types';

/**
 * One item as a card (#122): an optional thumbnail, its text, and at most
 * one link, which on the public lanyard opens from a click anywhere on the
 * card while its text stays selectable.
 * In the customiser the card adds its show/hide control (and, for kept
 * records, Edit and Delete) beside its content, never inside the link; a
 * hidden card stays in place, dashed and tagged "Hidden".
 */
export function CardItem({
  itemKey,
  title,
  thumbnail,
  children,
  className,
}: CardItemProps) {
  const { t } = useLingui();
  const actions = use(ItemActionsContext);
  const editing = actions !== null;
  const hidden = actions?.isHidden(itemKey) ?? false;
  const cardRef = useRef<HTMLDivElement>(null);

  // On the public lanyard a click anywhere opens the card's link, unless
  // the visitor is selecting text (a drag, a double-click) or pressed
  // something of its own. Keyboards and screen readers use the link.
  useEffect(() => {
    const card = cardRef.current;
    if (editing || !card) return;
    const open = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest('a, button, input, select, textarea')) return;
      if (event.detail > 1) return;
      if (window.getSelection()?.toString()) return;
      card.querySelector('a')?.click();
    };
    card.addEventListener('click', open);
    return () => card.removeEventListener('click', open);
  }, [editing]);
  return (
    <div
      ref={cardRef}
      data-card=""
      data-hidden={hidden ? 'true' : undefined}
      className={cn(
        styles.card,
        !editing && styles.opens,
        hidden && styles.hidden,
        className
      )}
    >
      {thumbnail && (
        <div
          data-thumbnail=""
          className={cn(styles.thumbnail, hidden && styles.faded)}
        >
          {thumbnail}
        </div>
      )}
      <div data-card-content="" className={styles.content}>
        {children}
        {hidden && <span className={styles.tag}>{t`Hidden`}</span>}
      </div>
      {actions && (
        <div className={styles.controls}>
          {actions.renderToggle(itemKey, title)}
          {actions.renderEdit?.(itemKey, title)}
        </div>
      )}
    </div>
  );
}
