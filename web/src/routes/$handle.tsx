import { isHandle } from '@atcute/lexicons/syntax';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { LanyardPage } from '@/features/lanyard/components/LanyardPage/LanyardPage';
import { LanyardProblem } from '@/features/lanyard/components/LanyardProblem/LanyardProblem';
import { LanyardSkeleton } from '@/features/lanyard/components/LanyardSkeleton/LanyardSkeleton';
import { LanyardSurface } from '@/features/lanyard/components/LanyardSurface/LanyardSurface';
import { useResolveHandle } from '@/features/lanyard/hooks/useResolveHandle';
import { prefetchHandleLanyard } from '@/lib/person/personQueries';

/**
 * A public lanyard at `/<handle>` (#150), the old site's address. The
 * beta's `/@<handle>` links come here; a DID goes to its stable route.
 */
export const Route = createFileRoute('/$handle')({
  beforeLoad: ({ params, location }) => {
    const bare = params.handle.replace(/^@/, '');
    if (bare.startsWith('did:')) {
      throw redirect({ href: `/d/${bare}${location.searchStr}` });
    }
    // Handles are case-insensitive; keep one canonical URL.
    const handle = bare.toLowerCase();
    if (!isHandle(handle)) throw notFound();
    if (handle !== params.handle) {
      throw redirect({ href: `/${handle}${location.searchStr}` });
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
