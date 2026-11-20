import '@/app/staticData';

import {
  createRootRouteWithContext,
  notFound,
  Outlet,
  redirect,
  useMatches,
} from '@tanstack/react-router';

import type { RouterContext } from '@/app/routerContext';
import { AppError } from '@/components/AppError/AppError';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { NotFound } from '@/components/NotFound/NotFound';
import { OfflineBanner } from '@/components/OfflineBanner/OfflineBanner';
import { FeedbackProvider } from '@/features/feedback/components/FeedbackProvider/FeedbackProvider';
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';
import { usePwaUpdatePrompt } from '@/hooks/usePwaUpdatePrompt';

const ENCODED_AT = '/%40';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    // Some apps percent-encode the @ in shared lanyard links.
    if (location.pathname.toLowerCase().startsWith(ENCODED_AT)) {
      let handle: string;
      try {
        handle = decodeURIComponent(location.pathname.slice(ENCODED_AT.length));
      } catch {
        // A malformed escape (a stray %) names nobody.
        throw notFound();
      }
      throw redirect({ href: `/@${handle}${location.searchStr}` });
    }
  },
  component: RootLayout,
  errorComponent: ({ error }) => <AppError error={error} />,
  notFoundComponent: () => <NotFound />,
});

function RootLayout() {
  usePwaUpdatePrompt();
  useFocusOnNavigation();
  // A route with its own header renders its <main> too, so its header is
  // still the page's one banner landmark.
  const ownHeader = useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData.ownHeader === true),
  });
  const signedOutActions = useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData.signedOutActions === true),
  });
  return (
    // Feedback opens over any page that offers it (#134).
    <FeedbackProvider>
      <div className="flex min-h-dvh flex-col">
        {ownHeader ? (
          <Outlet />
        ) : (
          <>
            <AppHeader signedOutActions={signedOutActions} />
            <main className="flex flex-1 flex-col">
              <Outlet />
            </main>
          </>
        )}
        <OfflineBanner />
      </div>
    </FeedbackProvider>
  );
}
