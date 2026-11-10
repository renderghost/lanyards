import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import type { RouterContext } from '@/app/routerContext';
import { AppError } from '@/components/AppError/AppError';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { NotFound } from '@/components/NotFound/NotFound';
import { OfflineBanner } from '@/components/OfflineBanner/OfflineBanner';
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';
import { usePwaUpdatePrompt } from '@/hooks/usePwaUpdatePrompt';

const ENCODED_AT = '/%40';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    // Some apps percent-encode the @ in shared lanyard links.
    if (location.pathname.toLowerCase().startsWith(ENCODED_AT)) {
      const handle = decodeURIComponent(
        location.pathname.slice(ENCODED_AT.length)
      );
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
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <OfflineBanner />
    </div>
  );
}
