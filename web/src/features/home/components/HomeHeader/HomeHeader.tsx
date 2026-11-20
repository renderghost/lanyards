import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import type { MouseEvent } from 'react';

import { Button } from '@/components/Button/Button';
import { Logo } from '@/components/Logo/Logo';
import { FIELD_ID } from '@/features/auth/components/SignInForm/SignInForm.constants';
import { useSession } from '@/features/auth/session/useSession';
import { useMakeLanyard } from '@/features/auth/useMakeLanyard';
import { cn } from '@/lib/utils';

import * as styles from './HomeHeader.styles';
import type { HomeHeaderProps } from './HomeHeader.types';

/**
 * The homepage's header (#151): the logo, Sign in and Make your lanyard,
 * straight on the brand blue the badge hangs on. The homepage is only
 * for people who aren't signed in, so these are all it offers.
 */
export function HomeHeader({ className }: HomeHeaderProps) {
  const { t } = useLingui();
  const session = useSession();
  const makeLanyard = useMakeLanyard();

  // The sign-in form is on the page: go to it, ready to type. Without it
  // (still loading), the link's own jump does (#148).
  function toSignInForm(event: MouseEvent<HTMLAnchorElement>) {
    const field = document.getElementById(FIELD_ID);
    if (!field) return;
    event.preventDefault();
    field.focus();
  }

  return (
    <header className={cn(styles.header, className)}>
      <Link to="/" className={styles.homeLink}>
        <Logo fixed="lime" />
      </Link>
      {session.status === 'signedOut' && (
        <div className={styles.actions}>
          <a
            href={`/#${FIELD_ID}`}
            onClick={toSignInForm}
            className={styles.signIn}
          >
            {t`Sign in`}
          </a>
          <Button
            tone="badge"
            size="md"
            className={styles.signUp}
            onClick={() => makeLanyard('/')}
          >
            {t`Make your lanyard`}
          </Button>
        </div>
      )}
    </header>
  );
}
