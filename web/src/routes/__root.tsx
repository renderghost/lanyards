import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import type { RouterContext } from '@/app/routerContext';
import { AppError } from '@/components/AppError/AppError';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { NotFound } from '@/components/NotFound/NotFound';
import { OfflineBanner } from '@/components/OfflineBanner/OfflineBanner';
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';
import { usePwaUpdatePrompt } from '@/hooks/usePwaUpdatePrompt';

export const Route = createRootRouteWithContext<RouterContext>()({
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
