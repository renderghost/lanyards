import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { IdCard, SlidersHorizontal } from 'lucide-react';

import { AccountLink } from '@/components/AccountLink/AccountLink';
import { buttonClassName } from '@/components/Button/buttonClassName';
import { Logo } from '@/components/Logo/Logo';
import { useSession } from '@/features/auth/session/useSession';
import { ShareLink } from '@/features/qr/components/ShareLink/ShareLink';
import { useOwnPaths } from '@/hooks/useOwnPaths';
import { OWN_PAGE_ACTIVE } from '@/lib/person/ownPaths';
import { cn } from '@/lib/utils';

import * as styles from './AppHeader.styles';
import type { AppHeaderProps } from './AppHeader.types';

/**
 * The top bar. Signed in (#150): the logo (your customiser), Customise and
 * View on the left; a page's own actions, Share and Account on the
 * right. On phones, the bottom bar carries the rest. Signed out, where
 * asked: Sign in, as a primary button (#162): a plain log in, landing on
 * your own customiser (#167); account creation is on the sign-in page.
 * (The homepage has its own header.)
 */
export function AppHeader({
  actions,
  signedOutActions = false,
  className,
}: AppHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const own = useOwnPaths();

  let end = null;
  if (own) {
    end = (
      <div className={styles.own}>
        <ShareLink />
        <AccountLink labelled />
      </div>
    );
  } else if (signedOutActions && session.status === 'signedOut') {
    end = (
      <Link
        to="/sign-in"
        className={buttonClassName({ className: styles.signIn })}
      >
        {t`Sign in`}
      </Link>
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
