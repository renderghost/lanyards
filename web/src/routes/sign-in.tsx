import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from '@/features/home/components/SignInPage/SignInPage';
import { safeReturnTo } from '@/lib/atproto/oauthConfig';

type SignInSearch = { returnTo?: string };

export const Route = createFileRoute('/sign-in')({
  // Always return the key: search params merge with the parent route's raw
  // params, so omitting it would let an unvalidated value through.
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const returnTo = safeReturnTo(search.returnTo);
    return { returnTo: returnTo === '/' ? undefined : returnTo };
  },
  // The page draws its own header, on the brand blue (#157).
  staticData: { ownHeader: true },
  component: SignIn,
});

function SignIn() {
  const { returnTo } = Route.useSearch();
  return <SignInPage returnTo={returnTo ?? '/'} />;
}
