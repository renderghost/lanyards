import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import {
  ADA,
  BOARD,
  mockFeedback,
  mockOwnerWrites,
  mockPerson,
  signIn,
} from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GRANULAR =
  'atproto include:app.lanyards.authFull repo:app.bsky.graph.follow?action=create&action=delete rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview';
const FEEDBACK = `${GRANULAR} repo:app.userinput.discussion?action=create blob:image/*`;

const dialog = (page: Page) =>
  page.getByRole('dialog', { name: 'Send feedback' });

const support = (page: Page) =>
  page.getByRole('region', { name: 'Beta support' });

/** From the sidebar's support, from md up. */
const openFeedback = (page: Page) =>
  support(page).getByRole('button', { name: 'Give feedback' }).click();

/** A noisy 1,200 × 900 PNG, about 3 MB: a big phone screenshot. */
async function largePng(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No canvas');
    const image = context.createImageData(canvas.width, canvas.height);
    for (let index = 0; index < image.data.length; index += 1) {
      image.data[index] = index % 4 === 3 ? 255 : Math.random() * 256;
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
  });
  return Buffer.from(dataUrl.split(',')[1] ?? '', 'base64');
}

/** The customiser, signed in as its owner with `scope`. */
async function customiser(
  page: Page,
  scope: string,
  options: { board?: boolean; hash?: string } = {}
) {
  await mockPerson(page);
  await mockOwnerWrites(page);
  const sent = await mockFeedback(page, options);
  await signIn(page, { did: ADA.did, scope });
  await page.goto(`/lanyard${options.hash ?? ''}`);
  // Arriving to reopen feedback, the dialog may hide the page at once.
  if (!options.hash) {
    await expect(
      page.getByRole('button', { name: 'Reorder Links' })
    ).toBeEnabled();
  }
  return sent;
}

test.describe('feedback (#134)', () => {
  test('keeps support in view at the foot of the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await customiser(page, GRANULAR);
    const inView = async () => {
      const box = await support(page).boundingBox();
      return Boolean(box && box.y >= 0 && box.y + box.height <= 720);
    };
    expect(await inView()).toBe(true);
    // The lanyard scrolls; the sidebar and its support stay put.
    await page.getByRole('region', { name: 'Preview' }).hover();
    await page.mouse.wheel(0, 4000);
    await expect
      .poll(() =>
        page
          .getByRole('heading', { name: 'Customise your lanyard' })
          .boundingBox()
          .then((box) => (box ? box.y : 0))
      )
      .toBeLessThan(0);
    expect(await inView()).toBe(true);
    await expect(
      support(page).getByRole('link', { name: /Signal group/ })
    ).toHaveAttribute('href', /^https:\/\/signal\.group\//);
    await expect(
      support(page).getByRole('link', { name: /Connect on Bluesky/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
    await expect(
      support(page).getByRole('link', { name: /Documentation/ })
    ).toHaveAttribute('href', 'https://github.com/renderghost/lanyards/wiki/');
  });

  test('asks for permission first', async ({ page }) => {
    await customiser(page, GRANULAR);
    await openFeedback(page);
    await expect(
      dialog(page).getByRole('button', { name: 'Give permission' })
    ).toBeVisible();
    await expect(dialog(page).getByLabel('Title')).toHaveCount(0);
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(result.violations).toEqual([]);
  });

  test('reopens after the permission sign-in, and tidies the address', async ({
    page,
  }) => {
    await customiser(page, FEEDBACK, { hash: '#feedback' });
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByLabel('Title')).toBeVisible();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('says when feedback isn’t open yet', async ({ page }) => {
    await customiser(page, FEEDBACK, { board: false });
    await openFeedback(page);
    await expect(dialog(page)).toContainText('Feedback isn’t open yet.');
    await expect(dialog(page)).toContainText('renderghost.101');
    await expect(dialog(page).getByLabel('Title')).toHaveCount(0);
  });

  test('sends a bug with a large screenshot at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const sent = await customiser(page, FEEDBACK);
    const png = await largePng(page);
    expect(png.length).toBeGreaterThan(2_500_000);

    // On phones, support is at the foot of the Style sheet.
    await page
      .getByRole('toolbar', { name: 'Customiser' })
      .getByRole('button', { name: 'Style' })
      .click();
    const sheet = page.getByRole('dialog', { name: 'Style' });
    const sheetSupport = sheet.getByRole('region', { name: 'Beta support' });
    const sheetBox = await sheet.boundingBox();
    const supportBox = await sheetSupport.boundingBox();
    expect(
      Math.abs(
        (sheetBox?.y ?? 0) +
          (sheetBox?.height ?? 0) -
          ((supportBox?.y ?? 0) + (supportBox?.height ?? 0))
      )
    ).toBeLessThan(2);
    await sheetSupport.getByRole('button', { name: 'Give feedback' }).click();
    await expect(sheet).toBeHidden();
    const form = dialog(page);
    await form.getByRole('radio', { name: 'bug' }).check();
    await form.getByLabel('Title').fill('The QR code is cut off');
    await form
      .getByLabel('Details', { exact: true })
      .fill('On my phone the bottom of the code is hidden.');
    const chooser = page.waitForEvent('filechooser');
    await form.getByRole('button', { name: 'Add screenshots' }).click();
    await (
      await chooser
    ).setFiles({ name: 'screenshot.png', mimeType: 'image/png', buffer: png });
    await expect(form.getByRole('img', { name: 'Screenshot 1' })).toBeVisible();
    await form.getByLabel('Describe screenshot 1').fill('The QR sheet');
    await form.getByLabel('Include technical details').check();
    await expect(form.locator('pre')).toContainText('Page: /lanyard');

    // Nothing in the dialog spills sideways at 320 px.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);

    await form.getByRole('button', { name: 'Send feedback' }).click();
    await expect(
      form.getByRole('heading', { name: 'Thank you' })
    ).toBeVisible();
    await expect(
      form.getByRole('link', { name: /View it on UserInput/ })
    ).toHaveAttribute('href', `https://userinput.app/d/${ADA.did}/3mfeedback`);

    expect(sent.uploads).toHaveLength(1);
    expect(sent.uploads[0]?.type).toBe('image/webp');
    expect(sent.uploads[0]?.size).toBeLessThanOrEqual(1_000_000);
    expect(sent.created).toHaveLength(1);
    const [post] = sent.created;
    expect(post?.repo).toBe(ADA.did);
    expect(post?.collection).toBe('app.userinput.discussion');
    expect(post?.record).toMatchObject({
      $type: 'app.userinput.discussion',
      space: { uri: BOARD.uri, cid: BOARD.cid },
      title: 'The QR code is cut off',
      tags: ['bug'],
      images: [
        {
          alt: 'The QR sheet',
          image: expect.objectContaining({ mimeType: 'image/webp' }),
        },
      ],
    });
    expect(post?.record.body).toContain(
      'On my phone the bottom of the code is hidden.'
    );
    expect(post?.record.body).toContain('Page: /lanyard');
  });

  test('captures the page without the dialog over it', async ({ page }) => {
    // The browser's share prompt can't be answered headless: share a
    // painted canvas instead, noting whether the dialog showed when asked.
    await page.addInitScript(() => {
      const record = window as unknown as { dialogAtCapture?: string };
      navigator.mediaDevices.getDisplayMedia = async () => {
        const open = document.querySelector('[role="dialog"]');
        record.dialogAtCapture = open
          ? getComputedStyle(open).visibility
          : 'closed';
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const context = canvas.getContext('2d');
        const paint = () => {
          if (!context) return;
          context.fillStyle = '#0a7';
          context.fillRect(0, 0, canvas.width, canvas.height);
          requestAnimationFrame(paint);
        };
        paint();
        return canvas.captureStream(30);
      };
    });
    await customiser(page, FEEDBACK);
    await openFeedback(page);
    await dialog(page)
      .getByRole('button', { name: 'Capture this screen' })
      .click();
    await expect(
      dialog(page).getByRole('img', { name: 'Screenshot 1' })
    ).toBeVisible();
    await expect(dialog(page)).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { dialogAtCapture?: string }).dialogAtCapture
      )
    ).toBe('hidden');
  });

  test('draws its choices in the app’s colours in dark mode', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await customiser(page, FEEDBACK);
    await openFeedback(page);
    const radio = dialog(page).getByRole('radio', { name: 'bug' });
    const tick = dialog(page).getByRole('checkbox', {
      name: 'Include technical details',
    });
    await expect(radio).toBeVisible();
    // The dialog's surface (#0e0a26), not the browser's grey control.
    const ground = (locator: typeof radio) =>
      locator.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(await ground(radio)).toBe('rgb(14, 10, 38)');
    expect(await ground(tick)).toBe('rgb(14, 10, 38)');
    await radio.check();
    await tick.check();
    await expect(radio).toBeChecked();
    // Checked, the primary colour: light on the dark ground.
    expect(await ground(tick)).toBe('rgb(246, 245, 255)');
  });
});
