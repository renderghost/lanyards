import { useLingui } from '@lingui/react/macro';
import { useMatch, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { HomePage } from '@/features/home/components/HomePage/HomePage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

import { SIGNED_IN_HOME } from './LandingPage.constants';
import type { LandingPageProps } from './LandingPage.types';

/**
 * `/` and `/sign-in` (#157, #175): one page, so it stays put between them.
 * At `/` its badge faces out, the homepage for people who aren't signed in
 * (#145); at `/sign-in` it's turned over to the sign-in form on its back.
 * Signed in, it sends people on: to where they were going, or their
 * lanyard.
 */
export function LandingPage({ className }: LandingPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  const signIn = useMatch({ from: '/_home/sign-in', shouldThrow: false });
  const face = signIn ? 'back' : 'front';
  useDocumentTitle(
    face === 'back' ? t`Sign in` : t`Researcher profiles on the AT Protocol`
  );
  const safe = safeReturnTo(signIn?.search.returnTo ?? '/');
  const destination = safe === '/' ? SIGNED_IN_HOME : safe;
  const signedIn = session.status === 'signedIn';

  useEffect(() => {
    // destination is a validated same-origin path, which may not be a
    // typed route, so use the history directly.
    if (signedIn) router.history.replace(destination);
  }, [signedIn, destination, router]);

  if (signedIn) return null;
  return <HomePage face={face} returnTo={destination} className={className} />;
}
