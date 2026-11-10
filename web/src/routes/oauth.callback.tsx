import {
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { CallbackStatus } from '@/features/auth/components/CallbackStatus/CallbackStatus';
import type { CallbackStatusValue } from '@/features/auth/components/CallbackStatus/CallbackStatus.types';
import { useSession } from '@/features/auth/session/useSession';
import { captureError } from '@/lib/analytics/analytics';
import { REDIRECT_PATH } from '@/lib/atproto/oauthConfig';
import { completeSignIn, OAuthCallbackError } from '@/lib/atproto/session';

export const Route = createFileRoute('/oauth/callback')({
  component: OAuthCallback,
});

function OAuthCallback() {
  const router = useRouter();
  const hash = useLocation({ select: (location) => location.hash });
  const { refresh } = useSession();
  const [status, setStatus] = useState<CallbackStatusValue>('working');
  const started = useRef(false);

  useEffect(() => {
    // The authorisation code can only be exchanged once.
    if (started.current) return;
    started.current = true;

    const pending = completeSignIn(hash ? `#${hash}` : '');
    // Scrub the code and state from the address bar straight away.
    router.history.replace(REDIRECT_PATH);

    pending.then(
      async ({ returnTo }) => {
        await refresh();
        router.history.replace(returnTo);
      },
      (error: unknown) => {
        const code =
          error instanceof OAuthCallbackError ? error.code : 'failed';
        if (code === 'failed')
          captureError(error, { source: 'oauth-callback' });
        setStatus(code);
      }
    );
  }, [hash, refresh, router]);

  return <CallbackStatus status={status} />;
}
