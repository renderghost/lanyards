import { createFileRoute, redirect } from '@tanstack/react-router';

import { LanyardPage } from '@/features/lanyard/components/LanyardPage/LanyardPage';
import { LanyardProblem } from '@/features/lanyard/components/LanyardProblem/LanyardProblem';
import { LanyardSkeleton } from '@/features/lanyard/components/LanyardSkeleton/LanyardSkeleton';
import { LanyardSurface } from '@/features/lanyard/components/LanyardSurface/LanyardSurface';
import { useResolveHandle } from '@/features/lanyard/hooks/useResolveHandle';
import { prefetchHandleLanyard } from '@/lib/person/personQueries';

export const Route = createFileRoute('/@{$handle}')({
  beforeLoad: ({ params }) => {
    // A DID after @ belongs on the stable DID route.
    if (params.handle.startsWith('did:')) {
      throw redirect({ href: `/d/${params.handle}` });
    }
    // Handles are case-insensitive; keep one canonical URL.
    const lower = params.handle.toLowerCase();
    if (lower !== params.handle) {
      throw redirect({ to: '/@{$handle}', params: { handle: lower } });
    }
  },
  // Starts the badge's reads while the page's code loads, so its short
  // wait for them (#129) costs nothing. Loading the readers lazily instead
  // measured slower (LCP 2.4–2.6 s against 2.3–2.4 s).
  loader: ({ context, params }) => {
    prefetchHandleLanyard(context.queryClient, params.handle);
  },
  staticData: { signedOutActions: true },
  component: HandleLanyard,
});

function HandleLanyard() {
  const { handle } = Route.useParams();
  const { state, retry } = useResolveHandle(handle);

  if (state.status === 'ready') {
    return <LanyardPage did={state.value} handle={handle} />;
  }
  // Until LanyardPage takes over, the lanyard's own ground stays put, so
  // the page doesn't flash the app's neutral canvas (#118).
  return (
    <LanyardSurface>
      {state.status === 'error' ? (
        <LanyardProblem error={state.error} handle={handle} onRetry={retry} />
      ) : (
        <LanyardSkeleton />
      )}
    </LanyardSurface>
  );
}
