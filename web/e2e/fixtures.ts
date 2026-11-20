import { test as base, expect } from '@playwright/test';

export const HEADING = 'Welcome to Lanyards';

/** The homepage's live sample lanyard (#145), framed at `md` and up. */
export const SAMPLE_PATH = '/renderg.host';

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
    // The homepage frames a real person's lanyard: stand in a page, so its
    // reads of that person never leave the run.
    await page.route(
      (url) => url.origin === APP_ORIGIN && url.pathname === SAMPLE_PATH,
      (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><title>Sample lanyard</title><h1>Sample</h1>',
        })
    );
    await use(page);
    expect(unexpected, 'unexpected third-party requests').toEqual([]);
  },
});

export { expect };
