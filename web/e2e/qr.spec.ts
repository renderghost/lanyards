import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { ADA, mockPerson, signIn } from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The spec's exit criterion: signed in to a scannable QR in under 30 s. */
const SIGN_IN_TO_QR_MS = 30_000;

test.describe('QR sheet', () => {
  test.beforeEach(async ({ page }) => {
    await mockPerson(page);
    await signIn(page, { did: ADA.did, scope: 'atproto transition:generic' });
    await page.setViewportSize({ width: 320, height: 640 });
  });

  test('goes from a signed-in home to a QR code in under 30 seconds', async ({
    page,
  }) => {
    const started = Date.now();
    await page.goto('/');
    await page.getByRole('button', { name: 'Show QR' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Ada Example' })
    ).toBeVisible();
    expect(Date.now() - started).toBeLessThan(SIGN_IN_TO_QR_MS);
  });

  test('opens from the header full screen, copies the link and closes', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/lanyard');
    const show = page.getByRole('button', { name: 'Show QR' });
    await expect(show).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(320);

    await show.click();
    const sheet = page.getByRole('dialog', { name: 'Ada Example' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('Scan to see my lanyard')).toBeVisible();
    const qr = sheet.getByRole('img', {
      name: /^QR code for https?:\/\/.+\/d\/did:plc:/,
    });
    await expect(qr).toBeVisible();
    for (const name of ['Copy link', 'Close']) {
      const box = await sheet.getByRole('button', { name }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(56);
    }

    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(result.violations).toEqual([]);

    await sheet.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByText('Link copied')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(new RegExp(`/d/${ADA.did}$`));

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(show).toBeFocused();
  });

  test('stays black on white in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/lanyard');
    await page.getByRole('button', { name: 'Show QR' }).click();
    const qr = page.getByRole('img', { name: /^QR code for / });
    await expect(qr.locator('rect')).toHaveAttribute('fill', '#ffffff');
    await expect(qr.locator('path')).toHaveAttribute('fill', '#000000');
  });
});
