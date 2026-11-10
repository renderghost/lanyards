import { createFileRoute, redirect } from '@tanstack/react-router';

import { LanyardPage } from '@/features/lanyard/components/LanyardPage/LanyardPage';
import { LanyardProblem } from '@/features/lanyard/components/LanyardProblem/LanyardProblem';
import { LanyardSkeleton } from '@/features/lanyard/components/LanyardSkeleton/LanyardSkeleton';
import { useResolveHandle } from '@/features/lanyard/hooks/useResolveHandle';

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
  component: HandleLanyard,
});

function HandleLanyard() {
  const { handle } = Route.useParams();
  const { state, retry } = useResolveHandle(handle);

  if (state.status === 'error') {
    return (
      <LanyardProblem error={state.error} handle={handle} onRetry={retry} />
    );
  }
  return state.status === 'ready' ? (
    <LanyardPage did={state.value} handle={handle} />
  ) : (
    <LanyardSkeleton />
  );
}
