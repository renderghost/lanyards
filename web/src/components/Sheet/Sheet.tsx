import { useLingui } from '@lingui/react/macro';
import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useRef } from 'react';

import { IconButton } from '../IconButton/IconButton';
import * as styles from './Sheet.styles';
import type { SheetProps } from './Sheet.types';

/**
 * A modal sheet that rises from the bottom of the screen, with a visible
 * title and a Close button. Focus moves to the sheet when it opens and back
 * to its trigger when it closes; Escape closes it.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  trigger,
  returnFocus,
}: SheetProps) {
  const { t } = useLingui();
  const contentRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          ref={contentRef}
          className={styles.content}
          aria-describedby={undefined}
          // Focus the sheet itself, so its name is announced and the Close
          // button's tooltip doesn't open (or need a second Escape).
          onOpenAutoFocus={(event) => {
            // Focus hasn't moved yet: this is what opened the sheet.
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            event.preventDefault();
            contentRef.current?.focus();
          }}
          // Radix returns focus to a trigger; without one it would drop
          // focus on the page.
          onCloseAutoFocus={(event) => {
            if (trigger) return;
            event.preventDefault();
            if (returnFocus) returnFocus();
            else opener.current?.focus();
          }}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label={t`Close`} icon={<X />} />
            </Dialog.Close>
          </div>
          <div className={styles.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
