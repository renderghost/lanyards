import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from '@tanstack/react-router';

import { Button } from '@/components/Button/Button';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { profileId } from '@/lib/atproto/profileId';
import { startSignUp } from '@/lib/atproto/session';
import { cn } from '@/lib/utils';

import { FollowButton } from '../FollowButton/FollowButton';
import * as styles from './VisitorActions.styles';
import type { VisitorActionsProps } from './VisitorActions.types';

/** What a visitor can do on a lanyard (spec §7.7). */
export function VisitorActions({
  did,
  handle,
  owner,
  className,
}: VisitorActionsProps) {
  const { t } = useLingui();
  const session = useSession();
  const path = useLocation({ select: (location) => location.pathname });

  if (owner) {
    return (
      <p className={cn(styles.own, className)}>{t`This is your lanyard`}</p>
    );
  }

  if (session.status === 'signedIn') {
    return (
      <div className={cn(styles.actions, className)}>
        <FollowButton did={did} handle={handle} returnTo={path} />
      </div>
    );
  }

  function createAccount() {
    startSignUp(path).catch(() => {
      notify.error(t`Couldn't start account creation. Please try again.`);
    });
  }

  return (
    <div className={cn(styles.actions, className)}>
      <ExternalLink
        href={`https://bsky.app/profile/${profileId(did, handle)}`}
        className={styles.link}
      >
        {t`Follow on Bluesky`}
      </ExternalLink>
      <Link to="/" search={{ returnTo: path }} className={styles.link}>
        {t`Sign in`}
      </Link>
      <Button size="lg" variant="secondary" onClick={createAccount}>
        {t`Create account`}
      </Button>
    </div>
  );
}
