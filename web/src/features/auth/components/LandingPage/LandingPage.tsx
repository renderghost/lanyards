import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { HomePage } from '@/features/home/components/HomePage/HomePage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

import { SIGNED_IN_HOME } from './LandingPage.constants';
import type { LandingPageProps } from './LandingPage.types';

/**
 * `/`: the homepage for people who aren't signed in (#145), which points
 * to the sign-in page (#157); signed in, it sends people to their lanyard.
 */
export function LandingPage({ className }: LandingPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  useDocumentTitle(t`Researcher profiles on the AT Protocol`);
  const signedIn = session.status === 'signedIn';

  useEffect(() => {
    if (signedIn) router.history.replace(SIGNED_IN_HOME);
  }, [signedIn, router]);

  if (signedIn) return null;
  return <HomePage className={className} />;
}
