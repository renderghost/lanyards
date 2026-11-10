import { createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';

import { queryClient } from './queryClient';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
  // Keep DIDs (did:plc:…) and handles readable in URLs.
  pathParamsAllowedCharacters: [':', '@'],
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
