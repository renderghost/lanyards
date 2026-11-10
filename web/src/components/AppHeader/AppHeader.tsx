import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/Logo/Logo';
import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { cn } from '@/lib/utils';

import * as styles from './AppHeader.styles';
import type { AppHeaderProps } from './AppHeader.types';

export function AppHeader({ className }: AppHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const did = session.status === 'signedIn' ? session.session.did : undefined;
  const profile = useProfile(did);

  return (
    <header className={cn(styles.header, className)}>
      <Link to="/" className={styles.homeLink}>
        <Logo />
      </Link>
      {did && (
        <Link
          to="/settings"
          aria-label={t`Your account`}
          className={styles.accountLink}
        >
          {profile.data?.avatar ? (
            <img src={profile.data.avatar} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatar} aria-hidden="true" />
          )}
        </Link>
      )}
    </header>
  );
}
