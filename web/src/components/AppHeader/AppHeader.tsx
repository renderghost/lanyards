import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from '@tanstack/react-router';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { Button } from '@/components/Button/Button';
import { Logo } from '@/components/Logo/Logo';
import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';
import { startSignUp } from '@/lib/atproto/session';
import { cn } from '@/lib/utils';

import * as styles from './AppHeader.styles';
import type { AppHeaderProps } from './AppHeader.types';

export function AppHeader({
  title,
  actions,
  signedOutActions = false,
  className,
}: AppHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const path = useLocation({ select: (location) => location.pathname });
  const signedIn = session.status === 'signedIn';

  function makeLanyard() {
    startSignUp(path).catch(() => {
      notify.error(t`Couldn't start account creation. Please try again.`);
    });
  }

  let own = null;
  if (signedIn) {
    own = (
      <nav aria-label={t`Your Lanyards`} className={styles.nav}>
        <Link to="/lanyard" className={styles.navLink}>
          {t`My lanyard`}
        </Link>
        <ShowQrButton />
        <AccountLink />
      </nav>
    );
  } else if (signedOutActions && session.status === 'signedOut') {
    own = (
      <div className={styles.nav}>
        <Link to="/" search={{ returnTo: path }} className={styles.navLink}>
          {t`Sign in`}
        </Link>
        <Button size="md" className={styles.signUp} onClick={makeLanyard}>
          {t`Make your lanyard`}
        </Button>
      </div>
    );
  }

  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.start}>
        <Link to="/" className={styles.homeLink}>
          <Logo />
        </Link>
        {title && <p className={styles.title}>{title}</p>}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : own}
    </header>
  );
}
