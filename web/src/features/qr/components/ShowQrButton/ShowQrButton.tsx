import { useLingui } from '@lingui/react/macro';
import { QrCode } from 'lucide-react';
import { useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import type { QrSheet } from '../QrSheet/QrSheet';
import * as styles from './ShowQrButton.styles';
import type { ShowQrButtonProps } from './ShowQrButton.types';

type Sheet = typeof QrSheet;

// The sheet (QR encoder and dialog) loads on first use, outside every
// route's initial JS; the service worker precaches it for offline use.
const loadSheet = (): Promise<Sheet> =>
  import('../QrSheet/QrSheet').then((module) => module.QrSheet);

/** "Show QR" in the header: opens the owner's QR sheet. */
export function ShowQrButton({ className }: ShowQrButtonProps) {
  const { t } = useLingui();
  const session = useSession();
  const [open, setOpen] = useState(false);
  /** The sheet, once its code has loaded. */
  const [Sheet, setSheet] = useState<Sheet | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  if (session.status !== 'signedIn') return null;

  async function show() {
    track('qr_opened');
    try {
      const loaded = Sheet ?? (await loadSheet());
      setSheet(() => loaded);
      setOpen(true);
    } catch (cause) {
      // Offline before the sheet was cached, or a deploy replaced it: the
      // app keeps working and the next press tries again.
      captureError(cause, { source: 'qr-sheet' });
      notify.error(t`Couldn't open your QR code. Please try again.`);
    }
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => void show()}
        className={cn(styles.button, className)}
      >
        <QrCode aria-hidden="true" className={styles.icon} />
        <span className={styles.label}>{t`Show QR`}</span>
      </button>
      {Sheet && (
        <Sheet
          did={session.session.did}
          open={open}
          onOpenChange={setOpen}
          returnFocus={() => button.current?.focus()}
        />
      )}
    </>
  );
}
