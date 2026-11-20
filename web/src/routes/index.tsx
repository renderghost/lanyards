import { createFileRoute } from '@tanstack/react-router';

import { LandingPage } from '@/features/auth/components/LandingPage/LandingPage';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

type LandingSearch = { returnTo?: string };

export const Route = createFileRoute('/')({
  // Always return the key: search params merge with the parent route's raw
  // params, so omitting it would let an unvalidated value through.
  validateSearch: (search: Record<string, unknown>): LandingSearch => {
    const returnTo = safeReturnTo(search.returnTo);
    return { returnTo: returnTo === '/' ? undefined : returnTo };
  },
  // The homepage draws its own header, on the brand blue (#151).
  staticData: { ownHeader: true },
  component: Landing,
});

function Landing() {
  const { returnTo } = Route.useSearch();
  return <LandingPage returnTo={returnTo ?? '/'} />;
}
