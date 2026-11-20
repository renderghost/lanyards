import { useLingui } from '@lingui/react/macro';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Dialog } from '@/components/Dialog/Dialog';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { useHasUnsavedChanges } from '@/hooks/useUnsavedChangesGuard';
import { FEEDBACK_SCOPE } from '@/lib/atproto/oauthConfig';
import { canSendFeedback, parseGrantedScope } from '@/lib/atproto/permissions';
import { startSignIn } from '@/lib/atproto/session';
import {
  InvalidRecordError,
  MissingPermissionError,
  ScopeRefusedError,
} from '@/lib/atproto/writes';

import { clearDraft, readDraft, saveDraft } from '../../draft';
import { captureScreen, type Screenshot } from '../../images';
import { useFeedbackBoard } from '../../useFeedbackBoard';
import {
  type FeedbackDraft,
  type SentFeedback,
  useSendFeedback,
} from '../../useSendFeedback';
import { ContactLinks } from '../ContactLinks/ContactLinks';
import { FeedbackForm } from '../FeedbackForm/FeedbackForm';
import { EMPTY_FEEDBACK } from '../FeedbackForm/FeedbackForm.constants';
import type { FeedbackValues } from '../FeedbackForm/FeedbackForm.types';
import { REOPEN_HASH } from './FeedbackDialog.constants';
import * as styles from './FeedbackDialog.styles';
import type { FeedbackDialogProps } from './FeedbackDialog.types';

const twoFrames = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

const release = (screenshots: Screenshot[]) => {
  for (const shot of screenshots) URL.revokeObjectURL(shot.previewUrl);
};

/**
 * Feedback to our UserInput board, over whatever page the person is on
 * (#134). Signed out, it gives the other ways to reach us; signed in, it
 * asks first for permission to post, then shows the form.
 *
 * It stays mounted while closed, so it holds the draft and the send:
 * closing loses nothing, and a send closed on still finishes. A draft
 * also survives the permission sign-in, which leaves the app.
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  returnFocus,
  page,
}: FeedbackDialogProps) {
  const { t } = useLingui();
  const session = useSession();
  const board = useFeedbackBoard();
  const send = useSendFeedback();
  const unsaved = useHasUnsavedChanges();
  // Read once: a draft kept through the permission sign-in.
  const [restored] = useState(readDraft);
  const [values, setValues] = useState<FeedbackValues>(
    () => restored?.values ?? EMPTY_FEEDBACK
  );
  const [sent, setSent] = useState<SentFeedback | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  /** The server refused a permission the session seemed to have. */
  const [refused, setRefused] = useState(false);
  const [asking, setAsking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  /** A fresh form after "Send more". */
  const [round, setRound] = useState(0);
  const permissionHeading = useRef<HTMLHeadingElement>(null);
  const thanksHeading = useRef<HTMLHeadingElement>(null);

  const signedIn = session.status === 'signedIn';
  const allowed =
    signedIn && canSendFeedback(parseGrantedScope(session.session.scope));

  // Put back once; a reload after this starts afresh.
  useEffect(() => clearDraft(), []);

  // Back from the authorisation page (Back restores this page as it was):
  // stop waiting on a sign-in that isn't happening.
  useEffect(() => {
    const reset = () => setAsking(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // A board that couldn't be read is tried again on opening.
  const retryBoard = useEffectEvent(() => {
    if (board.isError) void board.refetch();
  });
  useEffect(() => {
    if (open) retryBoard();
  }, [open]);

  // Take people to what just appeared: the permission step after a
  // refusal, the thanks after sending, even if it arrived while closed.
  useEffect(() => {
    if (open && refused) permissionHeading.current?.focus();
  }, [open, refused]);
  useEffect(() => {
    if (open && sent) thanksHeading.current?.focus();
  }, [open, sent]);

  function sendFeedback(draft: FeedbackDraft) {
    setFailure(null);
    send.mutate(draft, {
      onSuccess: (result) => {
        notify.success(t`Feedback sent`);
        release(draft.screenshots);
        setValues(EMPTY_FEEDBACK);
        setRefused(false);
        setSent(result);
      },
      onError: (error) => {
        if (
          error instanceof MissingPermissionError ||
          error instanceof ScopeRefusedError
        ) {
          setRefused(true);
        } else if (error instanceof InvalidRecordError) {
          setFailure(
            t`Our board can’t take this feedback as it is. Try a shorter title, details or screenshot descriptions.`
          );
        } else {
          setFailure(t`Couldn't send your feedback. Please try again.`);
        }
      },
    });
  }

  async function askPermission() {
    if (!signedIn || unsaved) return;
    setAsking(true);
    try {
      await saveDraft(values);
      await startSignIn(session.session.did, `${page}${REOPEN_HASH}`, {
        extraScope: FEEDBACK_SCOPE,
      });
    } catch {
      setAsking(false);
      notify.error(t`Couldn't start sign-in. Please try again.`);
    }
  }

  // The page behind, without the dialog over it.
  async function capture(): Promise<Blob> {
    setCapturing(true);
    try {
      await twoFrames();
      return await captureScreen();
    } finally {
      setCapturing(false);
    }
  }

  const contact = (
    <section className={styles.section} aria-labelledby="feedback-contact">
      <h3 id="feedback-contact" className={styles.heading}>
        {t`Other ways to reach us`}
      </h3>
      <ContactLinks board={board.data} />
    </section>
  );

  const permission = (
    <section
      className={styles.permission}
      aria-labelledby="feedback-permission"
    >
      <h3
        ref={permissionHeading}
        id="feedback-permission"
        tabIndex={-1}
        data-autofocus={refused ? '' : undefined}
        className={styles.heading}
      >
        {t`Lanyards needs your permission to post feedback`}
      </h3>
      <p className={styles.text}>
        {t`Your feedback is posted from your own account to our board on UserInput. To do that, Lanyards needs permission to post there and upload your screenshots.`}
      </p>
      {unsaved && (
        <p className={styles.text}>
          {t`Save or reset your lanyard changes first: giving permission leaves this page.`}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          onClick={() => void askPermission()}
          loading={asking}
          disabled={unsaved}
        >
          {t`Give permission`}
        </Button>
      </div>
    </section>
  );

  const boardLoading = board.isPending || (board.isError && board.isFetching);

  let content;
  if (sent) {
    content = (
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="feedback-thanks">
          <h3
            ref={thanksHeading}
            id="feedback-thanks"
            tabIndex={-1}
            data-autofocus=""
            className={styles.heading}
          >
            {t`Thank you`}
          </h3>
          <p className={styles.text}>
            {t`Your feedback is on our board, where you can follow what happens to it.`}
          </p>
          <div className={styles.actions}>
            <ExternalLink
              href={sent.url}
            >{t`View it on UserInput`}</ExternalLink>
            <Button
              variant="secondary"
              onClick={() => {
                setSent(null);
                setRound((count) => count + 1);
              }}
            >
              {t`Send more`}
            </Button>
          </div>
        </section>
      </div>
    );
  } else if (session.status === 'loading' || (signedIn && boardLoading)) {
    content = (
      <p role="status" className={styles.muted}>
        {t`Loading…`}
      </p>
    );
  } else if (!signedIn) {
    content = (
      <div className={styles.stack}>
        <p className={styles.text}>
          {t`Signed in, you can send us feedback, with screenshots, right from Lanyards. Or reach us here:`}
        </p>
        <ContactLinks board={board.data} />
      </div>
    );
  } else if (!board.data) {
    content = (
      <div className={styles.stack}>
        <p className={styles.text}>{t`Feedback isn’t open yet.`}</p>
        <ContactLinks board={null} />
      </div>
    );
  } else if (!allowed) {
    content = (
      <div className={styles.stack}>
        {permission}
        {contact}
      </div>
    );
  } else {
    content = (
      <div className={styles.stack}>
        {refused && permission}
        {restored?.screenshotsDropped && (
          <p className={styles.text}>
            {t`Your screenshots were too big to keep while you gave permission. Please add them again.`}
          </p>
        )}
        <FeedbackForm
          key={round}
          board={board.data}
          page={page}
          values={values}
          onChange={setValues}
          sending={send.isPending}
          onSend={sendFeedback}
          failure={failure}
          capture={capture}
        />
        {contact}
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t`Send feedback`}
      returnFocus={returnFocus}
      concealed={capturing}
    >
      {content}
    </Dialog>
  );
}
