import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { expect } from 'vitest';

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
    pathParamsAllowedCharacters: [':', '@'],
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

/** Renders `ui` as the only route, so router links work in unit tests. */
export function renderInRouter(ui: ReactElement, path = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [path] }),
    pathParamsAllowedCharacters: [':', '@'],
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AppI18nProvider>
        <RouterProvider router={router as never} />
      </AppI18nProvider>
    </QueryClientProvider>
  );
  return { router, ...view };
}

/**
 * Waits until the router has finished loading the current location,
 * including lazy route chunks. Tests that end on a navigation must await
 * this, or the load finishes after the test environment is torn down.
 */
export async function waitForRoute(
  router: { state: { status: string; resolvedLocation?: { href: string } } },
  href: string,
  timeout?: number
) {
  await waitFor(
    () => {
      expect(router.state.status).toBe('idle');
      expect(router.state.resolvedLocation?.href).toBe(href);
    },
    timeout ? { timeout } : undefined
  );
}
