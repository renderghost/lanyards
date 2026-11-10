import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

import { SignInForm } from '../SignInForm/SignInForm';
import { SIGNED_IN_HOME } from './LandingPage.constants';
import * as styles from './LandingPage.styles';
import type { LandingPageProps } from './LandingPage.types';

export function LandingPage({ returnTo }: LandingPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  useDocumentTitle(t`Sign in`);
  const safe = safeReturnTo(returnTo);
  const destination = safe === '/' ? SIGNED_IN_HOME : safe;

  const signedIn = session.status === 'signedIn';

  useEffect(() => {
    // destination is a validated same-origin path, which may not be a typed
    // route (e.g. one added in a later slice), so use the history directly.
    if (signedIn) router.history.replace(destination);
  }, [signedIn, destination, router]);

  if (signedIn) return null;

  return (
    <section className={styles.page} aria-labelledby="landing-heading">
      <h1 id="landing-heading" className={styles.heading}>
        {t`Your conference lanyard, from your AT Protocol account`}
      </h1>
      {session.status === 'loading' ? (
        <p role="status" className={styles.loading}>
          {t`Loading…`}
        </p>
      ) : (
        <SignInForm returnTo={destination} />
      )}
    </section>
  );
}
