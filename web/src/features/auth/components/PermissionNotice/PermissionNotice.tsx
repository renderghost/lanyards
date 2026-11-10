import { useLingui } from '@lingui/react/macro';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { startSignIn } from '@/lib/atproto/session';
import { cn } from '@/lib/utils';

import * as styles from './PermissionNotice.styles';
import type { PermissionNoticeProps } from './PermissionNotice.types';

/**
 * Explains that the session can't write yet (for example, it was granted
 * identity only) and sends the person to approve the permissions.
 */
export function PermissionNotice({
  returnTo,
  focusOnShow = false,
  className,
}: PermissionNoticeProps) {
  const { t } = useLingui();
  const session = useSession();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const shown = session.status === 'signedIn';

  useEffect(() => {
    if (focusOnShow && shown) headingRef.current?.focus();
  }, [focusOnShow, shown]);

  if (session.status !== 'signedIn') return null;
  const { did } = session.session;

  function approve() {
    setBusy(true);
    startSignIn(did, returnTo).catch(() => {
      setBusy(false);
      notify.error(t`Couldn't start sign-in. Please try again.`);
    });
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn(styles.notice, className)}
    >
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.heading}
      >
        {t`Lanyards needs your permission`}
      </h2>
      <p className={styles.text}>
        {t`To follow people and save your lanyard, Lanyards needs permission to write to your account. You'll be asked to approve it.`}
      </p>
      <Button onClick={approve} loading={busy}>
        {t`Give permission`}
      </Button>
    </section>
  );
}
