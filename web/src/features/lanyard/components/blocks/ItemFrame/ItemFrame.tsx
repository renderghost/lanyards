import { useLingui } from '@lingui/react/macro';
import { use } from 'react';

import { cn } from '@/lib/utils';

import { ItemActionsContext } from '../itemActions';
import * as styles from './ItemFrame.styles';
import type { ItemFrameProps } from './ItemFrame.types';

/**
 * Wraps one block item. On the public lanyard it adds nothing; in the
 * owner's editor it puts the item's show/hide control beside it, and a
 * hidden item stays in place, faded and labelled "Hidden" (#118).
 */
export function ItemFrame({
  itemKey,
  title,
  children,
  className,
}: ItemFrameProps) {
  const { t } = useLingui();
  const actions = use(ItemActionsContext);
  if (!actions) return children;
  const hidden = actions.isHidden(itemKey);
  return (
    <div
      data-hidden={hidden ? 'true' : undefined}
      className={cn(styles.frame, hidden && styles.hidden, className)}
    >
      <div className={cn(styles.content, hidden && styles.faded)}>
        {children}
      </div>
      {hidden && <span className={styles.tag}>{t`Hidden`}</span>}
      {actions.renderToggle(itemKey, title)}
    </div>
  );
}
