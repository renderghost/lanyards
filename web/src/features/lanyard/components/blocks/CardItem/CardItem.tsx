import { useLingui } from '@lingui/react/macro';
import { use } from 'react';

import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './CardItem.styles';
import type { CardItemProps } from './CardItem.types';

/**
 * One item as a card (#122): an optional thumbnail, its text, and at most
 * one link, which on the public lanyard opens from anywhere on the card.
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
  const hidden = actions?.isHidden(itemKey) ?? false;
  return (
    <div
      data-card=""
      data-hidden={hidden ? 'true' : undefined}
      className={cn(styles.card, hidden && styles.hidden, className)}
    >
      {thumbnail && (
        <div
          data-thumbnail=""
          className={cn(styles.thumbnail, hidden && styles.faded)}
        >
          {thumbnail}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {actions && (
        <>
          {hidden && <span className={styles.tag}>{t`Hidden`}</span>}
          <div className={styles.controls}>
            {actions.renderToggle(itemKey, title)}
            {actions.renderEdit?.(itemKey, title)}
          </div>
        </>
      )}
    </div>
  );
}
