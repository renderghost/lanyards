import AxeBuilder from '@axe-core/playwright';

import { expect, HEADING, test } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The sign-in page's heading (#157). */
const SIGN_IN = { level: 1, name: 'Sign in' } as const;

test('asks for a handle when submitted empty', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', SIGN_IN)).toBeVisible();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter your handle')).toBeVisible();
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`has no accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    const home = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(home.violations).toEqual([]);

    await page.goto('/sign-in');
    await expect(page.getByRole('heading', SIGN_IN)).toBeVisible();
    const clean = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(clean.violations).toEqual([]);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Enter your handle')).toBeVisible();
    const withError = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(withError.violations).toEqual([]);
  });
}

for (const path of ['/', '/sign-in']) {
  test(`fits a 320px-wide screen without sideways scrolling (${path})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
}

test.describe('the homepage (#145)', () => {
  test('takes Sign in at the top to the sign-in page (#157)', async ({
    page,
  }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    await expect(
      banner.getByRole('button', { name: 'Make your lanyard' })
    ).toHaveCount(0);
    await banner.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', SIGN_IN)).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Your handle' })
    ).toBeVisible();
  });

  test('leads with a call to action to the sign-in page (#157)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByTitle('Sample lanyard')).toHaveCount(0);
    const start = page.getByRole('region', {
      name: 'Everything you work on, in one link',
    });
    await start.getByRole('link', { name: 'Sign in to get started' }).click();
    await expect(page).toHaveURL('/sign-in');
  });

  test('takes “Create your lanyard” to the sign-in page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Create your lanyard' }).click();
    await expect(page).toHaveURL('/sign-in');
    await expect(page.getByRole('heading', SIGN_IN)).toBeVisible();
  });

  // Old links to the homepage's sign-in (#157).
  test('sends /?returnTo= on to the sign-in page', async ({ page }) => {
    await page.goto('/?returnTo=%2Fsettings');
    await expect(page).toHaveURL('/sign-in?returnTo=%2Fsettings');
    await expect(page.getByRole('heading', SIGN_IN)).toBeVisible();
  });
});

test.describe('the homepage’s hero (#151)', () => {
  /** The badge's transform, as the lanyard sways it (#174). */
  const swayOf = (page: import('@playwright/test').Page) =>
    page.evaluate(
      () =>
        document.querySelector<HTMLElement>('main [data-swing]')?.style
          .transform ?? null
    );

  /** The lanyard's tab's shift, as it sways with the badge. */
  const tabOf = (page: import('@playwright/test').Page) =>
    page.evaluate(
      () =>
        document.querySelector('main [data-tab]')?.getAttribute('transform') ??
        null
    );

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

  test('swings in, settles, then sways with the mouse and settles (#174)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    // It arrives swinging, then hangs straight within about six seconds.
    expect(await swayOf(page)).toMatch(/rotate\(/);
    await expect.poll(() => swayOf(page), { timeout: 9000 }).toBe('');
    await sweep(page);
    await expect
      .poll(() => swayOf(page), { timeout: 2000 })
      .toMatch(/^translateX\(-?[\d.]+px\) rotate\(-?[\d.]+deg\)$/);
    // The lanyard sways with it, a little.
    expect(await tabOf(page)).toMatch(/^translate\(-?[\d.]+ 0\)$/);
    // A few degrees at most, and still again after about six seconds.
    const angle = Number(
      /rotate\((-?[\d.]+)/.exec((await swayOf(page)) ?? '')?.[1]
    );
    expect(Math.abs(angle)).toBeLessThan(5);
    await expect.poll(() => swayOf(page), { timeout: 9000 }).toBe('');
    expect(await tabOf(page)).toBeNull();
  });

  test('keeps the badge still with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    // No swing as it arrives, and none for the mouse.
    expect(await swayOf(page)).toBe('');
    await sweep(page);
    await page.waitForTimeout(300);
    expect(await swayOf(page)).toBe('');
  });
});

test.describe('the homepage badge, turned over to sign in (#175)', () => {
  /** The badge's two faces, front then back. */
  const faces = (page: import('@playwright/test').Page) =>
    page.locator('main [data-face] > [data-sleeve]');

  test('turns over to the form, at the same size, and back again', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const turning = page.locator('main [data-face]');
    await expect(turning).toHaveAttribute('data-face', 'front');
    // It turns, rather than jumping.
    expect(
      await turning.evaluate(
        (element) => getComputedStyle(element).transitionDuration
      )
    ).toBe('0.7s');

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Sign in' })
      .click();
    await expect(page).toHaveURL('/sign-in');
    await expect(turning).toHaveAttribute('data-face', 'back');
    await expect(page.getByRole('heading', SIGN_IN)).toBeFocused();
    await page.waitForTimeout(800);
    // Front and back are one size, so the turn is convincing.
    const [front, back] = await Promise.all([
      faces(page).nth(0).boundingBox(),
      faces(page).nth(1).boundingBox(),
    ]);
    expect(back?.width).toBeCloseTo(front?.width ?? 0, 0);
    expect(back?.height).toBeCloseTo(front?.height ?? 0, 0);
    await expect(
      page.getByRole('combobox', { name: 'Your handle' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: HEADING })).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(turning).toHaveAttribute('data-face', 'front');
    await expect(page.getByRole('heading', { name: HEADING })).toBeFocused();
    await expect(page.getByRole('combobox')).toHaveCount(0);
  });

  test('turns over at once with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sign-in');
    const turning = page.locator('main [data-face]');
    await expect(turning).toHaveAttribute('data-face', 'back');
    expect(
      await turning.evaluate(
        (element) => getComputedStyle(element).transitionDuration
      )
    ).toBe('0s');
  });

  test('shows every suggestion for a handle, past the badge’s edge (#176)', async ({
    page,
  }) => {
    await page.route(
      'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead**',
      (route) =>
        route.fulfill({
          json: {
            actors: Array.from({ length: 8 }, (_, index) => ({
              did: `did:plc:suggestion${index}aaaaaaaaaaaaaa`,
              handle: `ren${index}.bsky.social`,
              displayName: `Ren ${index}`,
            })),
          },
        })
    );
    // On a phone the form is at the badge's foot, so the list hangs out.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/sign-in');
    await page.getByRole('combobox', { name: 'Your handle' }).fill('ren');
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option')).toHaveCount(8);
    await listbox.evaluate((element) =>
      element.scrollIntoView({ block: 'end' })
    );
    // Nothing it sits in clips it, however tall it grows.
    const clippers = await listbox.evaluate((element) => {
      const found: string[] = [];
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const { overflowY } = getComputedStyle(parent);
        if (overflowY !== 'visible')
          found.push(`${parent.tagName}: ${overflowY}`);
      }
      return found;
    });
    expect(clippers).toEqual([]);
    const box = await listbox.boundingBox();
    // Its foot is its own: nothing covers it.
    const foot = await page.evaluate(
      ({ x, y }) =>
        Boolean(document.elementFromPoint(x, y)?.closest('[role="listbox"]')),
      {
        x: (box?.x ?? 0) + (box?.width ?? 0) / 2,
        y: (box?.y ?? 0) + (box?.height ?? 0) - 4,
      }
    );
    expect(foot).toBe(true);
  });
});
