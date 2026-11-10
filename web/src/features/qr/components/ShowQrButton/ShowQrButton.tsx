import { useLingui } from '@lingui/react/macro';
import { QrCode } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { track } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import * as styles from './ShowQrButton.styles';
import type { ShowQrButtonProps } from './ShowQrButton.types';

// The sheet (QR encoder and dialog) loads on first use, outside every
// route's initial JS; the service worker precaches it for offline use.
const QrSheet = lazy(() =>
  import('../QrSheet/QrSheet').then((module) => ({ default: module.QrSheet }))
);

/** "Show QR" in the header: opens the owner's QR sheet. */
export function ShowQrButton({ className }: ShowQrButtonProps) {
  const { t } = useLingui();
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  if (session.status !== 'signedIn') return null;

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => {
          setUsed(true);
          setOpen(true);
          track('qr_opened');
        }}
        className={cn(styles.button, className)}
      >
        <QrCode aria-hidden="true" className={styles.icon} />
        <span className={styles.label}>{t`Show QR`}</span>
      </button>
      {used && (
        <Suspense fallback={null}>
          <QrSheet
            did={session.session.did}
            open={open}
            onOpenChange={setOpen}
            returnFocus={() => button.current?.focus()}
          />
        </Suspense>
      )}
    </>
  );
}
