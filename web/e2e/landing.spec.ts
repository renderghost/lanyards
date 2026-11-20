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

test.describe('the homepage’s hero (#151)', () => {
  /** The element around the heading that sways: its inline transform. */
  const swayOf = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      let element = document.querySelector<HTMLElement>('main h1');
      while (element && !element.classList.contains('origin-top')) {
        element = element.parentElement;
      }
      return element?.style.transform ?? null;
    });

  /** Sweeps the mouse right across the badge, in small steps. */
  async function sweep(page: import('@playwright/test').Page) {
    const box = await page
      .getByRole('heading', { name: HEADING })
      .boundingBox();
    const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    await page.mouse.move((box?.x ?? 0) + 10, y);
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 10, y, {
      steps: 12,
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`sets the header straight on the blue (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
      const banner = page.getByRole('banner');
      await expect(banner.getByRole('link', { name: 'Sign in' })).toBeVisible();
      // No bar: nothing painted behind it, and the hero starts under it.
      expect(
        await banner.evaluate(
          (header) => getComputedStyle(header).backgroundColor
        )
      ).toBe('rgba(0, 0, 0, 0)');
      expect((await banner.boundingBox())?.y).toBe(0);
      const ground = await page.evaluate(() => {
        const hero = document.querySelector('main section');
        const stage = hero?.firstElementChild;
        if (!stage) return null;
        return {
          top: stage.getBoundingClientRect().top,
          colour: getComputedStyle(stage).backgroundColor,
        };
      });
      expect(ground).toEqual({ top: 0, colour: 'rgb(64, 32, 223)' });
      const results = await new AxeBuilder({ page })
        .include('header')
        .withTags(WCAG)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('sways the badge with the mouse, then lets it settle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    expect(await swayOf(page)).toBe('');
    await sweep(page);
    await expect
      .poll(() => swayOf(page), { timeout: 2000 })
      .toMatch(/^rotate\(-?[\d.]+deg\)$/);
    // A few degrees at most, and still again within about three seconds.
    const angle = Number(/-?[\d.]+/.exec((await swayOf(page)) ?? '')?.[0]);
    expect(Math.abs(angle)).toBeLessThan(4);
    await expect.poll(() => swayOf(page), { timeout: 4000 }).toBe('');
  });

  test('keeps the badge still with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    await sweep(page);
    await page.waitForTimeout(300);
    expect(await swayOf(page)).toBe('');
  });
});
