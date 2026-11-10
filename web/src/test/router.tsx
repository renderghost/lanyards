import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';

import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { routeTree } from '@/routeTree.gen';

/** Renders the real route tree at `path`, without the session provider. */
export function renderRoute(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AppI18nProvider>
        <RouterProvider router={router} />
      </AppI18nProvider>
    </QueryClientProvider>
  );
  return { router, ...view };
}
