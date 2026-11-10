import { use } from 'react';

import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './ItemFrame.styles';
import type { ItemFrameProps } from './ItemFrame.types';

/**
 * Wraps one block item. On the public lanyard it adds nothing; in the
 * owner's preview it puts the item's menu (Hide this item) beside it.
 */
export function ItemFrame({
  itemKey,
  title,
  children,
  className,
}: ItemFrameProps) {
  const actions = use(ItemActionsContext);
  if (!actions) return children;
  return (
    <div className={cn(styles.frame, className)}>
      <div className={styles.content}>{children}</div>
      {actions.renderMenu(itemKey, title)}
    </div>
  );
}
