import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { Logo } from '@/components/Logo/Logo';
import { useSession } from '@/features/auth/session/useSession';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';
import { cn } from '@/lib/utils';

import * as styles from './AppHeader.styles';
import type { AppHeaderProps } from './AppHeader.types';

export function AppHeader({ title, actions, className }: AppHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const signedIn = session.status === 'signedIn';

  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.start}>
        <Link to="/" className={styles.homeLink}>
          <Logo />
        </Link>
        {title && <p className={styles.title}>{title}</p>}
      </div>
      {actions ? (
        <div className={styles.actions}>{actions}</div>
      ) : (
        signedIn && (
          <nav aria-label={t`Your Lanyards`} className={styles.nav}>
            <Link to="/lanyard" className={styles.navLink}>
              {t`My lanyard`}
            </Link>
            <ShowQrButton />
            <AccountLink />
          </nav>
        )
      )}
    </header>
  );
}
