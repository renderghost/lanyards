import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';

import { notify } from '@/components/Toaster/notify';
import { startSignUp } from '@/lib/atproto/session';

/**
 * Make your lanyard: starts account creation, coming back to `returnTo`,
 * and says so if it can't start.
 */
export function useMakeLanyard(): (returnTo: string) => void {
  const { t } = useLingui();
  return useCallback(
    (returnTo: string) => {
      startSignUp(returnTo).catch(() => {
        notify.error(t`Couldn't start account creation. Please try again.`);
      });
    },
    [t]
  );
}
