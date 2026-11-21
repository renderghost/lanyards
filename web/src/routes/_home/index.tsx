import { createFileRoute, redirect } from '@tanstack/react-router';

import { safeReturnTo } from '@/lib/atproto/oauthConfig';

type LandingSearch = { returnTo?: string };

/** `/`: the homepage, drawn by the _home layout (#175). */
export const Route = createFileRoute('/_home/')({
  // Always return the key: search params merge with the parent route's raw
  // params, so omitting it would let an unvalidated value through.
  validateSearch: (search: Record<string, unknown>): LandingSearch => {
    const returnTo = safeReturnTo(search.returnTo);
    return { returnTo: returnTo === '/' ? undefined : returnTo };
  },
  // Links from before sign-in had its own page go there (#157).
  beforeLoad: ({ search }) => {
    if (search.returnTo) {
      throw redirect({
        to: '/sign-in',
        search: { returnTo: search.returnTo },
        replace: true,
      });
    }
  },
});
