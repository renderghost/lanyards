import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Dialog } from '@/components/Dialog/Dialog';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { FEEDBACK_SCOPE } from '@/lib/atproto/oauthConfig';
import { canSendFeedback, parseGrantedScope } from '@/lib/atproto/permissions';
import { startSignIn } from '@/lib/atproto/session';

import { captureScreen } from '../../images';
import { useFeedbackBoard } from '../../useFeedbackBoard';
import type { SentFeedback } from '../../useSendFeedback';
import { ContactLinks } from '../ContactLinks/ContactLinks';
import { FeedbackForm } from '../FeedbackForm/FeedbackForm';
import { REOPEN_HASH } from './FeedbackDialog.constants';
import * as styles from './FeedbackDialog.styles';
import type { FeedbackDialogProps } from './FeedbackDialog.types';

const twoFrames = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

/**
 * Feedback to our UserInput board, over whatever page the person is on
 * (#134). Signed out, it gives the other ways to reach us; signed in, it
 * asks first for permission to post, then shows the form.
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
  const [sent, setSent] = useState<SentFeedback | null>(null);
  /** The server refused a permission the session seemed to have. */
  const [refused, setRefused] = useState(false);
  const [asking, setAsking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  /** A fresh form after "Send more". */
  const [round, setRound] = useState(0);

  const signedIn = session.status === 'signedIn';
  const allowed =
    signedIn && canSendFeedback(parseGrantedScope(session.session.scope));

  function askPermission() {
    if (!signedIn) return;
    setAsking(true);
    startSignIn(session.session.did, `${page}${REOPEN_HASH}`, {
      extraScope: FEEDBACK_SCOPE,
    }).catch(() => {
      setAsking(false);
      notify.error(t`Couldn't start sign-in. Please try again.`);
    });
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
      <h3 id="feedback-permission" className={styles.heading}>
        {t`Lanyards needs your permission to post feedback`}
      </h3>
      <p className={styles.text}>
        {t`Your feedback is posted from your own account to our board on UserInput. To do that, Lanyards needs permission to post there and upload your screenshots.`}
      </p>
      <div className={styles.actions}>
        <Button onClick={askPermission} loading={asking}>
          {t`Give permission`}
        </Button>
      </div>
    </section>
  );

  let content;
  if (sent) {
    content = (
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="feedback-thanks">
          <h3 id="feedback-thanks" className={styles.heading}>
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
  } else if (session.status === 'loading' || (signedIn && board.isPending)) {
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
        <FeedbackForm
          key={round}
          board={board.data}
          page={page}
          capture={capture}
          onSent={setSent}
          onNeedsPermission={() => setRefused(true)}
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
