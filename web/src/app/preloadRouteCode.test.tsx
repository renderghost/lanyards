import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { preloadRouteCode } from './preloadRouteCode';

/** A router whose `/people/$name` page and `/about` page load lazily. */
function setup(path: string) {
  const loadPerson = vi.fn(async () => ({
    default: () => <h1>A person</h1>,
  }));
  const loadAbout = vi.fn(async () => ({ default: () => <h1>About</h1> }));
  const beforeLoad = vi.fn();
  const loader = vi.fn();

  const root = createRootRoute({
    errorComponent: () => <p role="alert">Couldn&apos;t load this page</p>,
  });
  const person = createRoute({
    getParentRoute: () => root,
    path: '/people/$name',
    beforeLoad,
    loader,
    component: lazyRouteComponent(loadPerson),
  });
  const about = createRoute({
    getParentRoute: () => root,
    path: '/about',
    component: lazyRouteComponent(loadAbout),
  });
  const router = createRouter({
    routeTree: root.addChildren([person, about]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return { router, loadPerson, loadAbout, beforeLoad, loader };
}

describe('preloadRouteCode', () => {
  it("starts loading the current page's code, and no other page's", () => {
    const { router, loadPerson, loadAbout } = setup('/people/ada');
    preloadRouteCode(router);
    expect(loadPerson).toHaveBeenCalledTimes(1);
    expect(loadAbout).not.toHaveBeenCalled();
  });

  it("runs the page's beforeLoad and loader once, when the router loads it", async () => {
    const { router, loadPerson, beforeLoad, loader } = setup('/people/ada');
    preloadRouteCode(router);
    expect(beforeLoad).not.toHaveBeenCalled();
    expect(loader).not.toHaveBeenCalled();

    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole('heading', { name: 'A person' })
    ).toBeInTheDocument();
    expect(beforeLoad).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledTimes(1);
    // The router reuses the download already under way.
    expect(loadPerson).toHaveBeenCalledTimes(1);
  });

  it("shows a failed download as the route's error", async () => {
    const { router, loadPerson } = setup('/people/ada');
    loadPerson.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    preloadRouteCode(router);

    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load this page"
    );
    expect(loadPerson).toHaveBeenCalledTimes(1);
  });

  it('does nothing where no page matches', () => {
    const { router, loadPerson, loadAbout } = setup('/nowhere/at/all');
    expect(() => preloadRouteCode(router)).not.toThrow();
    expect(loadPerson).not.toHaveBeenCalled();
    expect(loadAbout).not.toHaveBeenCalled();
  });
});
