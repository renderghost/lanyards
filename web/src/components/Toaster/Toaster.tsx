import { Toaster as SonnerToaster } from 'sonner';

import {
  TOAST_DURATION_MS,
  TOAST_MOBILE_OFFSET,
  TOAST_OFFSET,
} from './Toaster.constants';
import * as styles from './Toaster.styles';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      theme="system"
      duration={TOAST_DURATION_MS}
      offset={TOAST_OFFSET}
      mobileOffset={TOAST_MOBILE_OFFSET}
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
