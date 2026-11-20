import { useLingui } from '@lingui/react/macro';
import { useLocation, useRouter } from '@tanstack/react-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { captureError } from '@/lib/analytics/analytics';

import { FeedbackContext } from '../../useFeedback';
import type { FeedbackDialog } from '../FeedbackDialog/FeedbackDialog';
import { REOPEN_FRAGMENT } from '../FeedbackDialog/FeedbackDialog.constants';
import type { FeedbackProviderProps } from './FeedbackProvider.types';

type Dialog = typeof FeedbackDialog;

// The dialog (form, screenshots, sending) loads on first use, outside
// every route's initial JS.
const loadDialog = (): Promise<Dialog> =>
  import('../FeedbackDialog/FeedbackDialog').then(
    (module) => module.FeedbackDialog
  );

/**
 * The app's one feedback dialog (#134): wherever it's opened from, it's
 * the same draft. It reopens when the permission sign-in sends the person
 * back with #feedback; the callback page navigates in the app, so this
 * follows the router's location rather than reading the address once.
 */
export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const { t } = useLingui();
  const router = useRouter();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [Dialog, setDialog] = useState<Dialog | null>(null);
  const restoreFocus = useRef<(() => void) | null>(null);
  const page = `${location.pathname}${location.searchStr}`;

  const reveal = (loaded: Dialog) => {
    setDialog(() => loaded);
    setOpen(true);
  };

  const fail = (cause: unknown) => {
    // Offline before the dialog was cached, or a deploy replaced it.
    captureError(cause, { source: 'feedback-dialog' });
    notify.error(t`Couldn't open feedback. Please try again.`);
  };

  function show(returnFocus: () => void) {
    restoreFocus.current = returnFocus;
    if (Dialog) setOpen(true);
    else loadDialog().then(reveal, fail);
  }

  // Back from the permission sign-in: open again, and tidy the address.
  const arrive = useEffectEvent((hash: string) => {
    if (hash !== REOPEN_FRAGMENT) return;
    router.history.replace(
      `${location.pathname}${location.searchStr}`,
      router.history.location.state,
      { ignoreBlocker: true }
    );
    loadDialog().then(
      (loaded) => reveal(loaded),
      (cause: unknown) => fail(cause)
    );
  });
  useEffect(() => arrive(location.hash), [location.hash]);

  return (
    <FeedbackContext value={{ show }}>
      {children}
      {Dialog && (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          returnFocus={() => restoreFocus.current?.()}
          page={page}
        />
      )}
    </FeedbackContext>
  );
}
