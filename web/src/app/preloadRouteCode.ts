import type { AnyRouter } from '@tanstack/react-router';

/**
 * Starts downloading the code of the routes at the router's current
 * location, without running them. Called before React's first render, the
 * page's code downloads while the app starts, not once the router has
 * (spec §2, #177). Each route's beforeLoad and loader still run once, when
 * the router loads it.
 */
export function preloadRouteCode(router: AnyRouter): void {
  const [routes] = router.getMatchedRoutes(router.latestLocation.pathname);
  for (const route of routes) {
    // The router waits on this same download when it loads the route, and
    // shows the route's error if it failed, as it would had it started the
    // download itself. Nothing is left to handle here.
    void router.loadRouteChunk(route)?.catch(() => undefined);
  }
}
