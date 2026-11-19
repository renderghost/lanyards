import { useLingui } from '@lingui/react/macro';
import { Palette } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { Button } from '@/components/Button/Button';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';

import { RESET_WITHOUT_ASKING } from '../CustomiserActions/CustomiserActions.constants';
import { MOVES } from './CustomiserToolbar.constants';
import * as styles from './CustomiserToolbar.styles';
import type { CustomiserToolbarProps } from './CustomiserToolbar.types';

/**
 * On phones, the customiser's bottom toolbar: Style (the sheet), Reset and
 * Show QR. The arrow keys, Home and End move between its buttons.
 */
export function CustomiserToolbar({
  onOpenStyle,
  styleButtonRef,
  onReset,
  dirty,
  changes,
}: CustomiserToolbarProps) {
  const { t } = useLingui();
  const resetMessage = t`Discard your unsaved changes?`;

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const to = MOVES[event.key];
    if (!to) return;
    const buttons = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
    ];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;
    event.preventDefault();
    buttons[to(index, buttons.length)]?.focus();
  }

  return (
    <div
      role="toolbar"
      aria-label={t`Customiser`}
      className={styles.toolbar}
      onKeyDown={move}
    >
      <Button
        ref={styleButtonRef}
        variant="ghost"
        size="sm"
        onClick={onOpenStyle}
      >
        <Palette aria-hidden="true" className={styles.icon} />
        {t`Style`}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-disabled={!dirty || undefined}
        onClick={() => {
          if (!dirty) return;
          if (changes > RESET_WITHOUT_ASKING && !window.confirm(resetMessage)) {
            return;
          }
          onReset();
        }}
      >
        {t`Reset`}
      </Button>
      <ShowQrButton />
    </div>
  );
}
