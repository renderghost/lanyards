import { useLingui } from '@lingui/react/macro';
import { Ellipsis } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

import { cn } from '@/lib/utils';

import * as styles from './ItemMenu.styles';
import type { ItemMenuProps } from './ItemMenu.types';

/** An item's menu in the owner's preview: hide it from the lanyard. */
export function ItemMenu({ title, onHide, className }: ItemMenuProps) {
  const { t } = useLingui();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t`More options for ${title}`}
        className={cn(styles.trigger, className)}
      >
        <Ellipsis aria-hidden="true" className={styles.icon} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className={styles.content}
        >
          <DropdownMenu.Item onSelect={onHide} className={styles.item}>
            {t`Hide this item`}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
