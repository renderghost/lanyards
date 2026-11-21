import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useId } from 'react';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { Logo } from '@/components/Logo/Logo';
import { SIGNED_IN_HOME } from '@/features/auth/components/LandingPage/LandingPage.constants';
import { SignInForm } from '@/features/auth/components/SignInForm/SignInForm';
import { useSession } from '@/features/auth/session/useSession';
import { LanyardStraps } from '@/features/qr/components/LanyardStraps/LanyardStraps';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

import { HomeHeader } from '../HomeHeader/HomeHeader';
import { BADGE_ACCENT, COVER } from './SignInPage.constants';
import * as styles from './SignInPage.styles';
import type { SignInPageProps } from './SignInPage.types';

/**
 * `/sign-in` (#157): the sign-in form, with its handle typeahead, on a
 * badge hanging on the brand blue. Signed in already, it sends people on
 * to where they were going.
 */
export function SignInPage({ returnTo }: SignInPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  const headingId = useId();
  useDocumentTitle(t`Sign in`);
  const safe = safeReturnTo(returnTo);
  const destination = safe === '/' ? SIGNED_IN_HOME : safe;
  const signedIn = session.status === 'signedIn';

  useEffect(() => {
    // destination is a validated same-origin path, which may not be a typed
    // route, so use the history directly.
    if (signedIn) router.history.replace(destination);
  }, [signedIn, destination, router]);

  return (
    <div data-accent="blue" className={styles.page}>
      <HomeHeader signIn={false} />
      <main className={styles.main}>
        <div data-accent={BADGE_ACCENT} className={styles.hang}>
          <LanyardStraps className={styles.straps} />
          <section aria-labelledby={headingId} className={styles.badge}>
            <div className={styles.cover}>
              <CoverPattern pattern={COVER} initials="L" />
              <span aria-hidden="true" className={styles.slot} />
            </div>
            <div className={styles.field}>
              <div className={styles.logoBox}>
                <Logo fixed="blue" className={styles.logo} />
              </div>
              <h1 id={headingId} className={styles.heading}>
                {t`Sign in`}
              </h1>
              <p className={styles.lede}>
                {t`Use your handle from Bluesky or any other AT Protocol app. New here? Create an account, and it’s yours to take anywhere.`}
              </p>
              {session.status === 'signedOut' ? (
                <SignInForm returnTo={destination} className={styles.form} />
              ) : (
                <p role="status" className={styles.loading}>
                  {t`Loading…`}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
