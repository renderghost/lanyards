import { useLingui } from '@lingui/react/macro';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AccountCard } from '@/features/account/components/AccountCard/AccountCard';
import { useSession } from '@/features/auth/session/useSession';

export const Route = createFileRoute('/settings')({
  component: Settings,
});

function Settings() {
  const { t } = useLingui();
  const router = useRouter();
  const session = useSession();
  const signedOut = session.status === 'signedOut';

  useEffect(() => {
    if (signedOut) {
      router.history.replace(`/?returnTo=${encodeURIComponent('/settings')}`);
    }
  }, [signedOut, router]);

  if (session.status !== 'signedIn') {
    return (
      <p role="status" className="px-4 py-12 text-center leading-6">
        {t`Loading…`}
      </p>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <h1 className="font-serif text-3xl leading-tight text-foreground">
        {t`Your account`}
      </h1>
      <AccountCard />
    </section>
  );
}
