import { Toaster as SonnerToaster } from 'sonner';

import { TOAST_DURATION_MS } from './Toaster.constants';
import * as styles from './Toaster.styles';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      theme="system"
      duration={TOAST_DURATION_MS}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: styles.toast,
          actionButton: styles.actionButton,
        },
      }}
    />
  );
}
