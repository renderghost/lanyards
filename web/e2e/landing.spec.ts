import AxeBuilder from '@axe-core/playwright';

import { expect, HEADING, test } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('asks for a handle when submitted empty', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter your handle')).toBeVisible();
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`has no accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    const clean = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(clean.violations).toEqual([]);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Enter your handle')).toBeVisible();
    const withError = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(withError.violations).toEqual([]);
  });
}

test('fits a 320px-wide screen without sideways scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  );
  expect(scrollWidth).toBeLessThanOrEqual(320);
});
