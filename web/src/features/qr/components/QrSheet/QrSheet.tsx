import { useLingui } from '@lingui/react/macro';
import { Dialog } from 'radix-ui';

import { Button } from '@/components/Button/Button';
import { QrCode } from '@/components/QrCode/QrCode';
import { notify } from '@/components/Toaster/notify';
import { useWakeLock } from '@/hooks/useWakeLock';
import { captureError } from '@/lib/analytics/analytics';
import { useProfile } from '@/lib/atproto/useProfile';

import { qrUrl } from '../../qrUrl';
import * as styles from './QrSheet.styles';
import type { QrSheetProps } from './QrSheet.types';

/**
 * The full-screen QR sheet: name, "Scan to see my lanyard", the code and
 * Copy link as a text alternative. Keeps the screen awake while open.
 */
export function QrSheet({
  did,
  open,
  onOpenChange,
  returnFocus,
}: QrSheetProps) {
  const { t } = useLingui();
  const profile = useProfile(did);
  const name =
    profile.data?.displayName || profile.data?.handle || t`Your lanyard`;
  const url = qrUrl(did);
  useWakeLock(open);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notify.success(t`Link copied`);
    } catch (cause) {
      captureError(cause, { source: 'copy-link' });
      notify.error(t`Couldn't copy the link. Please try again.`);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus();
          }}
        >
          <div className={styles.heading}>
            <Dialog.Title className={styles.title}>{name}</Dialog.Title>
            <Dialog.Description className={styles.description}>
              {t`Scan to see my lanyard`}
            </Dialog.Description>
          </div>
          <QrCode value={url} className={styles.code} />
          <div className={styles.actions}>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => void copy()}
              className={styles.action}
            >
              {t`Copy link`}
            </Button>
            <Dialog.Close asChild>
              <Button size="lg" className={styles.action}>
                {t`Close`}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
