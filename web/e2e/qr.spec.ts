import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { ADA, BEA, mockPerson, mockViewer, signIn } from './mocks';

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
    // The signed-in home is the customiser: '/' sends you on to it, and a
    // press on the header that's about to go is lost (a separate fix).
    await expect(page).toHaveURL('/lanyard');
    // The URL changes before the customiser's header replaces the landing
    // page's: wait for the customiser itself.
    await expect(
      page.getByRole('heading', { name: 'Customise your lanyard' })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Share' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Dr Ada Example' })
    ).toBeVisible();
    expect(Date.now() - started).toBeLessThan(SIGN_IN_TO_QR_MS);
  });

  test('opens from the header full screen, copies the link and closes', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/lanyard');
    const show = page.getByRole('link', { name: 'Share' });
    await expect(show).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(320);

    await show.click();
    // Its own page now, /<handle>/share (#150).
    await expect(page).toHaveURL('/alice.test/share');
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
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

    // Back where it was opened.
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL('/alice.test/edit');
  });

  test('keeps the whole code at least 240 px wide on a 320×640 screen (#129)', async ({
    page,
  }) => {
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    const qr = sheet.getByRole('img', { name: /^QR code for / });
    await expect(qr).toBeVisible();
    const box = (await qr.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(240);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(box.y + box.height).toBeLessThanOrEqual(640);
    const overflow = await sheet.evaluate(
      (element) => element.scrollHeight - element.clientHeight
    );
    expect(overflow).toBe(0);
    for (const name of ['Copy link', 'Close']) {
      const button = (await sheet.getByRole('button', { name }).boundingBox())!;
      expect(button.y + button.height).toBeLessThanOrEqual(640);
    }
  });

  test('keeps the code large and on screen in phone landscape', async ({
    page,
  }) => {
    const viewport = { width: 844, height: 390 };
    await page.setViewportSize(viewport);
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    const qr = sheet.getByRole('img', { name: /^QR code for / });
    await expect(qr).toBeVisible();
    const code = await qr.boundingBox();
    expect(code?.height ?? 0).toBeGreaterThanOrEqual(280);
    for (const box of [
      code,
      await sheet.getByRole('button', { name: 'Copy link' }).boundingBox(),
      await sheet.getByRole('button', { name: 'Close' }).boundingBox(),
    ]) {
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height
      );
    }
  });

  // Final review I2: sideways, the sheet's ground is the accent itself.
  test('shows its focus ring sideways on every accent (#129)', async ({
    page,
  }) => {
    await mockPerson(page, { config: { accent: 'lime' } });
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    await expect(sheet).toHaveAttribute('data-accent', 'lime');
    for (const name of ['Copy link', 'Close']) {
      const button = sheet.getByRole('button', { name });
      // Focus from the keyboard, so the ring shows.
      await button.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      // The ring fades in (transition-colors): read it once settled.
      const ratio = () =>
        button.evaluate((element) => {
          const rgb = (value: string) =>
            (value.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
          const luminance = ([r, g, b]: number[]) =>
            [r!, g!, b!]
              .map((channel) => channel / 255)
              .map((c) =>
                c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
              )
              .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);
          const ring = luminance(rgb(getComputedStyle(element).outlineColor));
          const ground = luminance(
            rgb(
              getComputedStyle(element.closest('[role=dialog]')!)
                .backgroundColor
            )
          );
          return (
            (Math.max(ring, ground) + 0.05) / (Math.min(ring, ground) + 0.05)
          );
        });
      await expect.poll(ratio).toBeGreaterThanOrEqual(3);
    }
  });

  test('fits a nearly square landscape window without spilling', async ({
    page,
  }) => {
    const viewport = { width: 430, height: 390 };
    await page.setViewportSize(viewport);
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    await expect(sheet).toBeVisible();
    // Nothing spills or scrolls, in either direction.
    const overflow = await sheet.evaluate((element) => ({
      x: element.scrollWidth - element.clientWidth,
      y: element.scrollHeight - element.clientHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    // The code is whole and still a good size.
    const code = await sheet
      .getByRole('img', { name: /^QR code for / })
      .boundingBox();
    expect(code?.height ?? 0).toBeGreaterThanOrEqual(200);
    expect(code?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((code?.y ?? 0) + (code?.height ?? 0)).toBeLessThanOrEqual(
      viewport.height
    );
    // Each button's label fits inside it.
    for (const name of ['Copy link', 'Close']) {
      const button = sheet.getByRole('button', { name });
      const fits = await button.evaluate(
        (element) => element.scrollWidth <= element.clientWidth
      );
      expect(fits).toBe(true);
      const box = await button.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width
      );
    }
  });

  test('closes from its corner on a portrait tablet, over the lanyard (#170)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    await expect(sheet).toBeVisible();
    // A real click: it fails if the strap is over the button.
    await sheet.getByRole('button', { name: 'Close' }).click({ timeout: 2000 });
    await expect(sheet).toBeHidden();
  });

  test('sways with the mouse, as the homepage’s does, then settles (#174)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const sheet = page.getByRole('dialog', { name: 'Dr Ada Example' });
    const sleeve = sheet.locator('[data-sleeve]');
    // Straight as it opens: the code is there to be scanned.
    expect(await sleeve.evaluate((element) => element.style.transform)).toBe(
      ''
    );
    const box = await sleeve.boundingBox();
    const y = (box?.y ?? 0) + (box?.height ?? 0) * 0.7;
    await page.mouse.move((box?.x ?? 0) + 10, y);
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 10, y, {
      steps: 12,
    });
    await expect
      .poll(() => sleeve.evaluate((element) => element.style.transform))
      .toMatch(/rotate\(/);
    await expect
      .poll(() => sleeve.evaluate((element) => element.style.transform), {
        timeout: 9000,
      })
      .toBe('');
  });

  test('stays black on white in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/lanyard');
    await page.getByRole('link', { name: 'Share' }).click();
    const qr = page.getByRole('img', { name: /^QR code for / });
    await expect(qr.locator('rect')).toHaveAttribute('fill', '#ffffff');
    await expect(qr.locator('path')).toHaveAttribute('fill', '#000000');
  });
});

test.describe('the Share badge, opened on someone else’s lanyard (#129)', () => {
  const BEA_PDS = 'https://pds.bea.test';
  const CID = `bafyrei${'b'.repeat(52)}`;

  test.beforeEach(async ({ page }) => {
    // Ada's lanyard is mint; Bea, signed in, owns a pink one.
    await mockPerson(page, { config: { accent: 'mint' } });
    await page.route(
      'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile**',
      (route) =>
        // By DID or by handle, as the AppView answers.
        [BEA.did, 'bea.test'].includes(
          new URL(route.request().url()).searchParams.get('actor') ?? ''
        )
          ? route.fulfill({
              json: {
                did: BEA.did,
                handle: 'bea.test',
                displayName: 'Bea Example',
              },
            })
          : route.fallback()
    );
    // The DID is URL-encoded in the request.
    await page.route('https://plc.directory/**', (route) =>
      !decodeURIComponent(route.request().url()).endsWith(BEA.did)
        ? route.fallback()
        : route.fulfill({
            json: {
              '@context': ['https://www.w3.org/ns/did/v1'],
              id: BEA.did,
              alsoKnownAs: ['at://bea.test'],
              verificationMethod: [],
              service: [
                {
                  id: '#atproto_pds',
                  type: 'AtprotoPersonalDataServer',
                  serviceEndpoint: BEA_PDS,
                },
              ],
            },
          })
    );
    await page.route(`${BEA_PDS}/xrpc/com.atproto.repo.getRecord**`, (route) =>
      route.fulfill({
        json: {
          uri: `at://${BEA.did}/app.lanyards.actor.lanyard/self`,
          cid: CID,
          value: {
            $type: 'app.lanyards.actor.lanyard',
            accent: 'pink',
            createdAt: '2026-11-01T09:00:00.000Z',
          },
        },
      })
    );
    await page.route(
      `${BEA_PDS}/xrpc/com.atproto.repo.listRecords**`,
      (route) => route.fulfill({ json: { records: [] } })
    );
    await page.route(
      'https://sifa.id/xrpc/id.sifa.getProfileView**',
      (route) =>
        new URL(route.request().url()).searchParams.get('actor') === BEA.did
          ? route.fulfill({
              status: 400,
              json: { error: 'ProfileNotFound' },
            })
          : route.fallback()
    );
    await mockViewer(page);
    await signIn(page, { did: BEA.did, scope: 'atproto transition:generic' });
  });

  test('wears the owner’s accent, and leaves the page’s alone', async ({
    page,
  }) => {
    await page.goto('/alice.test');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
    ).toBeVisible();
    const pageAccent = () =>
      page.evaluate(() => document.documentElement.dataset.accent);
    expect(await pageAccent()).toBe('mint');

    const show = page.getByRole('banner').getByRole('link', {
      name: 'Share',
    });
    await show.click();
    const sheet = page.getByRole('dialog', { name: 'Bea Example' });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-accent', 'pink');
    const card = sheet.locator('.bg-accent').first();
    await expect(card).toHaveCSS('background-color', 'rgb(247, 135, 154)');
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(result.violations).toEqual([]);

    // Back on Ada's lanyard, in Ada's accent.
    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL('/alice.test');
    await expect.poll(pageAccent).toBe('mint');
  });
});
