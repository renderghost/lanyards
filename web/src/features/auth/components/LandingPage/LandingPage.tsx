import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { HomePage } from '@/features/home/components/HomePage/HomePage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

import { SignInForm } from '../SignInForm/SignInForm';
import { SIGNED_IN_HOME } from './LandingPage.constants';
import * as styles from './LandingPage.styles';
import type { LandingPageProps } from './LandingPage.types';

/**
 * `/`: the homepage for people who aren't signed in (#145), with the
 * sign-in form; signed in, it sends people on to where they're going.
 */
export function LandingPage({ returnTo }: LandingPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  const safe = safeReturnTo(returnTo);
  // Sent here to sign in, it says so; otherwise it's the homepage.
  useDocumentTitle(
    safe === '/' ? t`Researcher profiles on the AT Protocol` : t`Sign in`
  );
  const destination = safe === '/' ? SIGNED_IN_HOME : safe;

  const signedIn = session.status === 'signedIn';

  useEffect(() => {
    // destination is a validated same-origin path, which may not be a typed
    // route (e.g. one added in a later slice), so use the history directly.
    if (signedIn) router.history.replace(destination);
  }, [signedIn, destination, router]);

  if (signedIn) return null;

  return (
    <HomePage
      signIn={
        session.status === 'loading' ? (
          <p role="status" className={styles.loading}>
            {t`Loading…`}
          </p>
        ) : (
          <SignInForm returnTo={destination} />
        )
      }
    />
  );
}
