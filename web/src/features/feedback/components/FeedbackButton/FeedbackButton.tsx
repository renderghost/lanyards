import { useLingui } from '@lingui/react/macro';
import { useLocation, useRouter } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { notify } from '@/components/Toaster/notify';
import { captureError } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import type { FeedbackDialog } from '../FeedbackDialog/FeedbackDialog';
import { REOPEN_FRAGMENT } from '../FeedbackDialog/FeedbackDialog.constants';
import * as styles from './FeedbackButton.styles';
import type { FeedbackButtonProps } from './FeedbackButton.types';

type Dialog = typeof FeedbackDialog;

// The dialog (form, screenshots, sending) loads on first use, outside
// every route's initial JS.
const loadDialog = (): Promise<Dialog> =>
  import('../FeedbackDialog/FeedbackDialog').then(
    (module) => module.FeedbackDialog
  );

/** "Send feedback": opens feedback over the current page (#134). */
export function FeedbackButton({
  autoOpen = false,
  className,
}: FeedbackButtonProps) {
  const { t } = useLingui();
  const router = useRouter();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [Dialog, setDialog] = useState<Dialog | null>(null);
  const button = useRef<HTMLButtonElement>(null);
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

  function show() {
    if (Dialog) setOpen(true);
    else loadDialog().then(reveal, fail);
  }

  // Back from the permission sign-in: open again, and tidy the address.
  // The callback page navigates here in the app, so this follows the
  // router's location rather than reading the address once (#134).
  const arrive = useEffectEvent((hash: string) => {
    if (!autoOpen || hash !== REOPEN_FRAGMENT) return;
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
    <>
      <button
        ref={button}
        type="button"
        onClick={show}
        className={cn(styles.button, className)}
      >
        <MessageSquare aria-hidden="true" className={styles.icon} />
        {t`Send feedback`}
      </button>
      {Dialog && (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          returnFocus={() => button.current?.focus()}
          page={page}
        />
      )}
    </>
  );
}
