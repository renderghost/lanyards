import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { useResolveHandle } from '@/features/lanyard/hooks/useResolveHandle';
import { CustomisePage } from '@/features/lanyard/customise/CustomisePage/CustomisePage';

/**
 * Customise, at `/<handle>/edit` (#150): the owner's alone. Anyone else
 * goes to that person's lanyard; anyone signed out signs in first. A DID
 * stands in for a handle that doesn't verify.
 */
export const Route = createFileRoute('/$handle_/edit')({
  beforeLoad: ({ params }) => {
    const lower = params.handle.toLowerCase();
    if (!params.handle.startsWith('did:') && lower !== params.handle) {
      throw redirect({ href: `/${lower}/edit` });
    }
  },
  // The customiser's header carries Save and Reset.
  staticData: { ownHeader: true },
  component: EditLanyard,
});

function EditLanyard() {
  const { handle } = Route.useParams();
  const session = useSession();
  // Loading, or signed out: the customiser waits, or sends them to sign in.
  if (session.status !== 'signedIn') return <CustomisePage />;
  return <OwnerOnly handle={handle} did={session.session.did} />;
}

function OwnerOnly({ handle, did }: { handle: string; did: string }) {
  const router = useRouter();
  const { state } = useResolveHandle(handle);
  const owner = state.status === 'ready' && state.value === did;
  // Someone else's, or nobody's: their lanyard page says which.
  const elsewhere =
    (state.status === 'ready' && !owner) || state.status === 'error';

  useEffect(() => {
    if (elsewhere) router.history.replace(`/${handle}`);
  }, [elsewhere, handle, router]);

  return <CustomisePage pending={!owner} />;
}
