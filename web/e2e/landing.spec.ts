import AxeBuilder from '@axe-core/playwright';

import { expect, HEADING, SAMPLE_PATH, test } from './fixtures';

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

test.describe('the homepage (#145)', () => {
  test('frames a sample lanyard on desktop, and links to it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    const frame = page.getByTitle('Sample lanyard');
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute('src', SAMPLE_PATH);
    await expect(
      page.frameLocator('iframe[title="Sample lanyard"]').getByRole('heading')
    ).toHaveText('Sample');
    await expect(
      page.getByRole('link', { name: /View sample profile/ })
    ).toHaveAttribute('href', SAMPLE_PATH);
  });

  test('links to the sample, without the frame, on phones', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    await expect(page.getByTitle('Sample lanyard')).toBeHidden();
    await expect(
      page.getByRole('link', { name: /View sample profile/ })
    ).toBeVisible();
  });

  test('takes “Create your lanyard” to the sign-in form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create your lanyard' }).click();
    const handle = page.getByRole('combobox', { name: 'Your handle' });
    await expect(handle).toBeFocused();
    await expect(handle).toBeInViewport();
  });

  test('offers Sign in at the top, taking people to the form (#148)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const signIn = page
      .getByRole('banner')
      .getByRole('link', { name: 'Sign in' });
    await expect(signIn).toBeInViewport();
    const handle = page.getByRole('combobox', { name: 'Your handle' });
    await expect(handle).not.toBeInViewport();
    await signIn.click();
    await expect(handle).toBeFocused();
    await expect(handle).toBeInViewport();
  });
});
