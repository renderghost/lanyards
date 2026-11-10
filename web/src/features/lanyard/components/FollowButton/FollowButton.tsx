import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { PermissionNotice } from '@/features/auth/components/PermissionNotice/PermissionNotice';
import { cn } from '@/lib/utils';

import { useFollow } from '../../hooks/useFollow';
import * as styles from './FollowButton.styles';
import type { FollowButtonProps } from './FollowButton.types';

/** Follow or unfollow someone on Bluesky from their lanyard. */
export function FollowButton({
  did,
  handle,
  returnTo,
  className,
}: FollowButtonProps) {
  const { t } = useLingui();
  const hintId = useId();
  const follow = useFollow(did, handle);
  const [askForPermission, setAskForPermission] = useState(false);

  const following = follow.state === 'following';
  const checking =
    follow.state === 'unknown' &&
    !follow.needsPermission &&
    !follow.checkFailed;

  function press() {
    if (follow.needsPermission) {
      setAskForPermission(true);
    } else if (following) {
      follow.unfollow();
    } else {
      follow.follow();
    }
  }

  return (
    <div className={cn(styles.wrapper, className)}>
      <Button
        size="lg"
        variant={following ? 'secondary' : 'primary'}
        onClick={press}
        loading={follow.pending || checking}
        disabled={follow.checkFailed}
        aria-describedby={follow.checkFailed ? hintId : undefined}
      >
        {following ? t`Following` : t`Follow`}
      </Button>
      {follow.checkFailed && (
        <p id={hintId} className={styles.hint}>
          {t`Couldn't check whether you already follow them`}
        </p>
      )}
      {askForPermission && <PermissionNotice returnTo={returnTo} />}
    </div>
  );
}
