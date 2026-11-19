import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { cn } from '@/lib/utils';

import * as styles from './AccountLink.styles';
import type { AccountLinkProps } from './AccountLink.types';

/** The signed-in person's avatar, linking to their account settings. */
export function AccountLink({ className }: AccountLinkProps) {
  const { t } = useLingui();
  const session = useSession();
  const did = session.status === 'signedIn' ? session.session.did : undefined;
  const profile = useProfile(did);
  if (!did) return null;
  return (
    <Link
      to="/settings"
      aria-label={t`Your account`}
      className={cn(styles.link, className)}
    >
      {profile.data?.avatar ? (
        <img src={profile.data.avatar} alt="" className={styles.avatar} />
      ) : (
        <span className={styles.avatar} aria-hidden="true" />
      )}
    </Link>
  );
}
