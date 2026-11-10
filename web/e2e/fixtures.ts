import { test as base, expect } from '@playwright/test';

export const HEADING = 'Your conference lanyard, from your AT Protocol account';

const APP_ORIGIN = 'http://127.0.0.1:4173';

/**
 * Keeps e2e runs hermetic: Bluesky's public AppView is answered locally, and
 * any other request leaving the app's origin is blocked and fails the test.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const unexpected: string[] = [];
    await page.route(
      (url) => url.origin !== APP_ORIGIN,
      (route) => {
        unexpected.push(route.request().url());
        return route.abort();
      }
    );
    await page.route('https://public.api.bsky.app/**', (route) =>
      route.fulfill({ json: { actors: [] } })
    );
    await use(page);
    expect(unexpected, 'unexpected third-party requests').toEqual([]);
  },
});

export { expect };
