import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from '@tanstack/react-router';
import { IdCard, SlidersHorizontal } from 'lucide-react';
import type { MouseEvent } from 'react';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { Button } from '@/components/Button/Button';
import { Logo } from '@/components/Logo/Logo';
import { notify } from '@/components/Toaster/notify';
import { FIELD_ID } from '@/features/auth/components/SignInForm/SignInForm.constants';
import { useSession } from '@/features/auth/session/useSession';
import { ShowQrButton } from '@/features/qr/components/ShowQrButton/ShowQrButton';
import { useOwnPaths } from '@/hooks/useOwnPaths';
import { OWN_PAGE_ACTIVE } from '@/lib/person/ownPaths';
import { startSignUp } from '@/lib/atproto/session';
import { cn } from '@/lib/utils';

import * as styles from './AppHeader.styles';
import type { AppHeaderProps } from './AppHeader.types';

/**
 * The top bar. Signed in (#150): the logo (your customiser), Customise and
 * View on the left; a page's own actions, Show QR and Account on the
 * right. On phones, the bottom bar carries the rest. Signed out, where
 * asked: Sign in and Make your lanyard.
 */
export function AppHeader({
  actions,
  signedOutActions = false,
  className,
}: AppHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const path = useLocation({ select: (location) => location.pathname });
  const own = useOwnPaths();

  function makeLanyard() {
    startSignUp(path).catch(() => {
      notify.error(t`Couldn't start account creation. Please try again.`);
    });
  }

  // On the homepage the sign-in form is on the page: go to it, ready to
  // type. Without it (still loading), the link's own jump does.
  function toSignInForm(event: MouseEvent<HTMLAnchorElement>) {
    const field = document.getElementById(FIELD_ID);
    if (!field) return;
    event.preventDefault();
    field.focus();
  }

  let end = null;
  if (own) {
    end = (
      <div className={styles.own}>
        <ShowQrButton />
        <AccountLink labelled />
      </div>
    );
  } else if (signedOutActions && session.status === 'signedOut') {
    end = (
      <div className={styles.nav}>
        {path === '/' ? (
          <a
            href={`/#${FIELD_ID}`}
            onClick={toSignInForm}
            className={styles.navLink}
          >
            {t`Sign in`}
          </a>
        ) : (
          <Link to="/" search={{ returnTo: path }} className={styles.navLink}>
            {t`Sign in`}
          </Link>
        )}
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
        {own && (
          <nav aria-label={t`Your Lanyards`} className={styles.ownNav}>
            <Link
              to="/$handle/edit"
              params={{ handle: own.id }}
              activeOptions={OWN_PAGE_ACTIVE}
              className={styles.ownLink}
            >
              <SlidersHorizontal aria-hidden="true" className={styles.icon} />
              {t`Customise`}
            </Link>
            {own.id.startsWith('did:') ? (
              <Link
                to="/d/$did"
                params={{ did: own.id }}
                activeOptions={OWN_PAGE_ACTIVE}
                className={styles.ownLink}
              >
                <IdCard aria-hidden="true" className={styles.icon} />
                {t`View`}
              </Link>
            ) : (
              <Link
                to="/$handle"
                params={{ handle: own.id }}
                activeOptions={OWN_PAGE_ACTIVE}
                className={styles.ownLink}
              >
                <IdCard aria-hidden="true" className={styles.icon} />
                {t`View`}
              </Link>
            )}
          </nav>
        )}
      </div>
      {(actions || end) && (
        <div className={styles.end}>
          {actions}
          {end}
        </div>
      )}
    </header>
  );
}
