import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { ADA, mockPerson, signIn } from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('QR sheet', () => {
  test.beforeEach(async ({ page }) => {
    await mockPerson(page);
    await signIn(page, { did: ADA.did, scope: 'atproto transition:generic' });
    await page.setViewportSize({ width: 320, height: 640 });
  });

  test('opens from the header full screen, with large controls', async ({
    page,
  }) => {
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
    await expect(
      sheet.getByRole('img', {
        name: /^QR code for https?:\/\/.+\/d\/did:plc:/,
      })
    ).toBeVisible();
    for (const name of ['Copy link', 'Close']) {
      const box = await sheet.getByRole('button', { name }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(56);
    }

    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(result.violations).toEqual([]);

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
