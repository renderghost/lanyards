import { useLingui } from '@lingui/react/macro';
import { Ellipsis } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

import * as styles from './ItemMenu.styles';
import type { ItemMenuProps } from './ItemMenu.types';

/** An item's menu in the owner's preview: hide it from the lanyard. */
export function ItemMenu({ title, onHide, className }: ItemMenuProps) {
  const { t } = useLingui();
  // Hiding removes this menu's button, so focus goes where the customiser
  // sends it (the item's Show again) instead of back to the trigger. If
  // the item couldn't be hidden, focus returns to the trigger as usual.
  const hiding = useRef(false);
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
          onCloseAutoFocus={(event) => {
            if (!hiding.current) return;
            hiding.current = false;
            event.preventDefault();
          }}
        >
          <DropdownMenu.Item
            onSelect={() => {
              hiding.current = onHide();
            }}
            className={styles.item}
          >
            {t`Hide this item`}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
