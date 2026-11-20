import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { CustomisePage } from '@/features/lanyard/customise/CustomisePage/CustomisePage';
import { useOwnPaths } from '@/hooks/useOwnPaths';
import { useProfile } from '@/lib/atproto/useProfile';
import { ownPaths } from '@/lib/person/ownPaths';

/**
 * `/lanyard` forwards to your own customiser, `/<handle>/edit` (#150): old
 * bookmarks, and where sign-in lands. Signed out, you sign in first.
 */
export const Route = createFileRoute('/lanyard')({
  staticData: { ownHeader: true },
  component: ForwardToCustomise,
});

function ForwardToCustomise() {
  const session = useSession();
  if (session.status !== 'signedIn') return <CustomisePage />;
  return <Forward did={session.session.did} />;
}

function Forward({ did }: { did: string }) {
  const router = useRouter();
  const profile = useProfile(did);
  const own = useOwnPaths();
  // Once the handle is known, or can't be: then by DID.
  const target = profile.isSuccess
    ? own?.edit
    : profile.isError
      ? ownPaths(did).edit
      : undefined;

  useEffect(() => {
    if (target) router.history.replace(target);
  }, [target, router]);

  return <CustomisePage pending />;
}
