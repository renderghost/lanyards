import { useLingui } from '@lingui/react/macro';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useResolveHandle } from '@/features/lanyard/hooks/useResolveHandle';
import { track } from '@/lib/analytics/analytics';

import { QrSheet } from '../QrSheet/QrSheet';
import * as styles from './SharePage.styles';
import type { SharePageProps } from './SharePage.types';

/**
 * Share as a page, `/<handle>/share` (#150): the badge full screen, for
 * anyone's public lanyard. Close goes back where you were, or to the
 * lanyard when the page was opened on its own.
 */
export function SharePage({ handle }: SharePageProps) {
  const { t } = useLingui();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { state } = useResolveHandle(handle);
  const unknown = state.status === 'error';

  useEffect(() => {
    track('qr_opened');
  }, []);

  // Nobody by that name: their lanyard page says so.
  useEffect(() => {
    if (unknown) router.history.replace(`/${handle}`);
  }, [unknown, handle, router]);

  function close() {
    if (canGoBack) router.history.back();
    else router.history.replace(`/${handle}`);
  }

  if (state.status !== 'ready') {
    return (
      <p role="status" className={styles.waiting}>
        {t`Loading…`}
      </p>
    );
  }
  return (
    <QrSheet
      did={state.value}
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      // Focus belongs to the page Close goes to.
      returnFocus={() => {}}
    />
  );
}
