/**
 * Where the app used to live (#154). A visit there, including from a copy
 * installed with its service worker, moves to the build's base URL once
 * the base URL is somewhere else.
 */
export const RETIRED_ORIGINS: readonly string[] = ['https://next.lanyards.app'];

/** How long to spend clearing up before leaving regardless. */
const CLEAR_UP_MS = 1500;

/**
 * The same page at `baseUrl`, if `href` is on a retired origin that is no
 * longer the base URL; otherwise null.
 */
export function movedTo(href: string, baseUrl: string): string | null {
  const here = new URL(href);
  const home = new URL(baseUrl);
  if (here.origin === home.origin) return null;
  if (!RETIRED_ORIGINS.includes(here.origin)) return null;
  return new URL(`${here.pathname}${here.search}${here.hash}`, home).href;
}

export type LeaveDeps = {
  registrations(): Promise<readonly { unregister(): Promise<boolean> }[]>;
  cacheKeys(): Promise<readonly string[]>;
  deleteCache(key: string): Promise<boolean>;
  go(url: string): void;
};

/** The browser's own service workers, caches and navigation. */
export const browserLeaveDeps = (): LeaveDeps => ({
  registrations: async () =>
    (await navigator.serviceWorker?.getRegistrations()) ?? [],
  cacheKeys: async () => (await globalThis.caches?.keys()) ?? [],
  deleteCache: (key) => caches.delete(key),
  go: (url) => window.location.replace(url),
});

/**
 * Leaves for `url`, first dropping this origin's service worker and
 * caches so an installed copy doesn't keep serving the old app here.
 * Leaves anyway if that fails or takes too long.
 */
export async function leaveFor(
  url: string,
  deps: LeaveDeps = browserLeaveDeps()
): Promise<void> {
  const clearUp = Promise.allSettled([
    deps
      .registrations()
      .then((all) => Promise.all(all.map((each) => each.unregister()))),
    deps
      .cacheKeys()
      .then((keys) => Promise.all(keys.map((key) => deps.deleteCache(key)))),
  ]);
  await Promise.race([
    clearUp,
    new Promise((resolve) => setTimeout(resolve, CLEAR_UP_MS)),
  ]);
  deps.go(url);
}
