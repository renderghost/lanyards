import { createFileRoute } from '@tanstack/react-router';

import { safeReturnTo } from '@/lib/atproto/oauthConfig';

type SignInSearch = { returnTo?: string };

/**
 * `/sign-in` (#157): the homepage with its badge turned over to the form,
 * drawn by the _home layout (#175).
 */
export const Route = createFileRoute('/_home/sign-in')({
  // Always return the key: search params merge with the parent route's raw
  // params, so omitting it would let an unvalidated value through.
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const returnTo = safeReturnTo(search.returnTo);
    return { returnTo: returnTo === '/' ? undefined : returnTo };
  },
});
