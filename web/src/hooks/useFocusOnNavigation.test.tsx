import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFocusOnNavigation } from './useFocusOnNavigation';

function Root() {
  useFocusOnNavigation();
  return <Outlet />;
}

/** Two pages; on the second, a face turned away holds the first h1. */
function app() {
  const root = createRootRoute({ component: Root });
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <main>
        <h1>Home</h1>
      </main>
    ),
  });
  const turned = createRoute({
    getParentRoute: () => root,
    path: '/turned',
    component: () => (
      <main>
        <div inert>
          <h1>Turned away</h1>
        </div>
        <div>
          <h1>Turned up</h1>
        </div>
      </main>
    ),
  });
  const router = createRouter({
    routeTree: root.addChildren([home, turned]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe('useFocusOnNavigation', () => {
  it('leaves the first load alone', async () => {
    app();
    expect(
      await screen.findByRole('heading', { name: 'Home' })
    ).not.toHaveFocus();
  });

  it('lands on the new page’s heading after navigating', async () => {
    const router = app();
    await screen.findByRole('heading', { name: 'Home' });
    router.history.push('/turned');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Turned up' })).toHaveFocus()
    );
  });

  // A badge turned over keeps its front in the page, out of reach (#175).
  it('skips a heading that’s out of reach', async () => {
    const router = app();
    await screen.findByRole('heading', { name: 'Home' });
    router.history.push('/turned');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Turned up' })).toHaveFocus()
    );
    expect(
      screen.getByRole('heading', { name: 'Turned away' })
    ).not.toHaveFocus();
  });
});
