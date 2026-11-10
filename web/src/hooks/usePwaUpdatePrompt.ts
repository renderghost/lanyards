import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { notify } from '@/components/Toaster/notify';
import { track } from '@/lib/analytics/analytics';

/**
 * Registers the service worker and, when a new version is waiting, offers to
 * reload into it. Updates never apply without the user's say-so.
 */
export function usePwaUpdatePrompt(): void {
  const { t } = useLingui();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    notify.info(t`A new version of Lanyards is available`, {
      action: {
        label: t`Reload`,
        onClick: () => {
          track('pwa_update_applied');
          void updateServiceWorker(true);
        },
      },
    });
  }, [needRefresh, t, updateServiceWorker]);
}
