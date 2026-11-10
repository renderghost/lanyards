import { expect, HEADING, test } from './fixtures';

test('is installable and keeps working offline', async ({ page, context }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await page.request.get(href as string)).json();
  expect(manifest.name).toBe('Lanyards');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // The first visit installs the worker; the next load is served by it.
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller))
    )
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
  await expect(
    page.getByText(
      "You're offline. Some things won't work until you reconnect."
    )
  ).toBeVisible();
});
