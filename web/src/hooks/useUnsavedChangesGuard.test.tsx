import {
  createBrowserHistory,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

const MESSAGE = 'Leave without saving? Your changes will be lost.';

function Customiser({ dirty }: { dirty: boolean }) {
  useUnsavedChangesGuard(dirty, MESSAGE);
  return <p>Customiser</p>;
}

/** The customiser at /lanyard, having come from /. */
async function renderGuarded(dirty: boolean) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <Customiser dirty={dirty} />,
    }),
    history: createMemoryHistory({
      initialEntries: ['/', '/lanyard'],
      initialIndex: 1,
    }),
  });
  render(<RouterProvider router={router as never} />);
  await screen.findByText('Customiser');
  return router;
}

const at = (router: Awaited<ReturnType<typeof renderGuarded>>) =>
  router.state.location.pathname;

/** Lets a navigation (and any blocker it meets) settle. */
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useUnsavedChangesGuard', () => {
  it('asks before leaving with unsaved changes', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = await renderGuarded(true);
    act(() => router.history.push('/settings'));
    await settle();
    expect(confirm).toHaveBeenCalledWith(MESSAGE);
    expect(at(router)).toBe('/lanyard');

    confirm.mockReturnValue(true);
    act(() => router.history.push('/settings'));
    await waitFor(() => expect(at(router)).toBe('/settings'));
  });

  it('asks before going back with unsaved changes', async () => {
    // Browser Back arrives as popstate, which only browser history sees.
    // Its entries carry the index TanStack measures each step with.
    const history = createBrowserHistory();
    history.replace('/');
    history.push('/lanyard');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = createRouter({
      routeTree: createRootRoute({
        component: () => <Customiser dirty />,
      }),
      history,
    });
    render(<RouterProvider router={router as never} />);
    await screen.findByText('Customiser');
    act(() => window.history.back());
    await waitFor(() => expect(confirm).toHaveBeenCalledWith(MESSAGE));
    await settle();
    expect(window.location.pathname).toBe('/lanyard');
    expect(router.state.location.pathname).toBe('/lanyard');
  });

  it('doesn’t ask when there’s nothing to save', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const router = await renderGuarded(false);
    act(() => router.history.push('/settings'));
    await waitFor(() => expect(at(router)).toBe('/settings'));
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before the tab closes, only while there are changes', async () => {
    const closing = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const dirty = await renderGuarded(true);
    expect(at(dirty)).toBe('/lanyard');
    expect(closing()).toBe(true);
    cleanup();
    await renderGuarded(false);
    expect(closing()).toBe(false);
  });
});
