import { useLingui } from '@lingui/react/macro';
import { X } from 'lucide-react';
import { Dialog as Primitive } from 'radix-ui';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

import { IconButton } from '../IconButton/IconButton';
import * as styles from './Dialog.styles';
import type { DialogProps } from './Dialog.types';

/** The form fields a dialog opens on: the first one that can be used. */
const FIELDS =
  'input:not([type=hidden]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';

/**
 * A modal dialog for a short form: a visible title, a Close button, and
 * focus on its first field when it opens. Escape and Close close it; a
 * click outside doesn't, so nothing typed is lost by accident. On close,
 * focus goes back to whatever opened it.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  returnFocus,
  concealed = false,
  className,
}: DialogProps) {
  const { t } = useLingui();
  const contentRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Primitive.Root open={open} onOpenChange={onOpenChange}>
      <Primitive.Portal>
        <Primitive.Overlay
          className={cn(styles.overlay, concealed && styles.concealed)}
        />
        <Primitive.Content
          ref={contentRef}
          className={cn(
            styles.content,
            concealed && styles.concealed,
            className
          )}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // Focus hasn't moved yet: this is what opened the dialog.
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            event.preventDefault();
            const field =
              contentRef.current?.querySelector<HTMLElement>(FIELDS);
            (field ?? contentRef.current)?.focus();
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus) returnFocus();
            else opener.current?.focus();
          }}
        >
          <div className={styles.header}>
            <Primitive.Title className={styles.title}>{title}</Primitive.Title>
            <Primitive.Close asChild>
              <IconButton label={t`Close`} icon={<X />} />
            </Primitive.Close>
          </div>
          <div className={styles.body}>{children}</div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
