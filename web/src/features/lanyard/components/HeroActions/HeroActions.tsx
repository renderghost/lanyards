import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from '@tanstack/react-router';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { useSession } from '@/features/auth/session/useSession';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';
import { profileId } from '@/lib/atproto/profileId';
import { cn } from '@/lib/utils';

import { FollowButton } from '../FollowButton/FollowButton';
import * as styles from './HeroActions.styles';
import type { HeroActionsProps } from './HeroActions.types';

/**
 * What the viewer can do from the badge (spec §7): the owner edits their
 * lanyard or shows its QR code; a signed-in visitor follows; a signed-out
 * visitor follows on Bluesky. Signing in lives in the app header.
 */
export function HeroActions({
  did,
  handle,
  mode,
  className,
}: HeroActionsProps) {
  const { t } = useLingui();
  const session = useSession();
  const path = useLocation({ select: (location) => location.pathname });

  if (mode === 'owner') {
    return (
      <div className={cn(styles.actions, className)}>
        <Link to="/lanyard" className={styles.primary}>
          {t`Edit lanyard`}
        </Link>
        <ShowQrButton tone="badge" />
      </div>
    );
  }

  if (session.status === 'signedIn') {
    return (
      <div className={cn(styles.actions, className)}>
        <FollowButton did={did} handle={handle} returnTo={path} tone="badge" />
      </div>
    );
  }

  return (
    <div className={cn(styles.actions, className)}>
      <ExternalLink
        tone="badge"
        href={`https://bsky.app/profile/${profileId(did, handle)}`}
        className={styles.primary}
      >
        {t`Follow on Bluesky`}
      </ExternalLink>
    </div>
  );
}
