import { useLingui } from '@lingui/react/macro';
import { Palette } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { Button } from '@/components/Button/Button';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';

import { RESET_WITHOUT_ASKING } from '../CustomiserActions/CustomiserActions.constants';
import { MOVES } from './CustomiserToolbar.constants';
import * as styles from './CustomiserToolbar.styles';
import type { CustomiserToolbarProps } from './CustomiserToolbar.types';

/**
 * On phones, the customiser's bottom toolbar: Style (the sheet), Reset,
 * Show QR and the account link (Settings, signing out). The arrow keys,
 * Home and End move between them.
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
    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]'),
    ];
    const index = controls.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    event.preventDefault();
    controls[to(index, controls.length)]?.focus();
  }

  return (
    <div
      role="toolbar"
      aria-label={t`Customiser`}
      // Keeps focused controls scrolled clear of it (see index.css).
      data-bottom-toolbar=""
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
      <AccountLink />
    </div>
  );
}
