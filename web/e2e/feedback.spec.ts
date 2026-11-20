import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, HEADING, test } from './fixtures';
import {
  ADA,
  BEA,
  BOARD,
  mockFeedback,
  mockPerson,
  mockViewer,
  signIn,
} from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GRANULAR =
  'atproto include:app.lanyards.authFull repo:app.bsky.graph.follow?action=create&action=delete rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview';
const FEEDBACK = `${GRANULAR} repo:app.userinput.discussion?action=create blob:image/*`;

const dialog = (page: Page) =>
  page.getByRole('dialog', { name: 'Send feedback' });

const openFeedback = (page: Page) =>
  page
    .getByRole('contentinfo')
    .getByRole('button', { name: 'Send feedback' })
    .click();

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

/** The person's own lanyard page, as someone signed in. */
async function signedInOnLanyard(
  page: Page,
  scope: string,
  options: { board?: boolean; hash?: string } = {}
) {
  await mockPerson(page);
  await mockViewer(page);
  const sent = await mockFeedback(page, options);
  await signIn(page, { did: BEA.did, scope });
  await page.goto(`/@${ADA.handle}${options.hash ?? ''}`);
  // Arriving to reopen feedback, the dialog may hide the page at once.
  if (!options.hash) {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
    ).toBeVisible();
  }
  return sent;
}

test.describe('feedback (#134)', () => {
  test('signed out: the other ways to reach us, and no form', async ({
    page,
  }) => {
    await mockFeedback(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: HEADING })).toBeVisible();
    await openFeedback(page);
    await expect(dialog(page)).toBeVisible();
    await expect(
      dialog(page).getByRole('link', {
        name: /Follow @lanyards.app on Bluesky/,
      })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
    await expect(dialog(page)).toContainText('renderghost.101');
    await expect(
      dialog(page).getByRole('link', { name: /See our feedback board/ })
    ).toHaveAttribute(
      'href',
      'https://userinput.app/s/did:plc:ua3d6biqepazbq6mw4ysotfo/3mboard'
    );
    await expect(dialog(page).getByLabel('Title')).toHaveCount(0);
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(result.violations).toEqual([]);
  });

  test('asks for permission first', async ({ page }) => {
    await signedInOnLanyard(page, GRANULAR);
    await openFeedback(page);
    await expect(
      dialog(page).getByRole('button', { name: 'Give permission' })
    ).toBeVisible();
    await expect(dialog(page).getByLabel('Title')).toHaveCount(0);
  });

  test('reopens after the permission sign-in, and tidies the address', async ({
    page,
  }) => {
    await signedInOnLanyard(page, FEEDBACK, { hash: '#feedback' });
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByLabel('Title')).toBeVisible();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('says when feedback isn’t open yet', async ({ page }) => {
    await signedInOnLanyard(page, FEEDBACK, { board: false });
    await openFeedback(page);
    await expect(dialog(page)).toContainText('Feedback isn’t open yet.');
    await expect(dialog(page)).toContainText('renderghost.101');
    await expect(dialog(page).getByLabel('Title')).toHaveCount(0);
  });

  test('sends a bug with a large screenshot at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const sent = await signedInOnLanyard(page, FEEDBACK);
    const png = await largePng(page);
    expect(png.length).toBeGreaterThan(2_500_000);

    await openFeedback(page);
    const form = dialog(page);
    await form.getByRole('radio', { name: 'Bug' }).check();
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
    await expect(form.locator('pre')).toContainText('Page: /@alice.test');

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
    ).toHaveAttribute('href', `https://userinput.app/d/${BEA.did}/3mfeedback`);

    expect(sent.uploads).toHaveLength(1);
    expect(sent.uploads[0]?.type).toBe('image/webp');
    expect(sent.uploads[0]?.size).toBeLessThanOrEqual(1_000_000);
    expect(sent.created).toHaveLength(1);
    const [post] = sent.created;
    expect(post?.repo).toBe(BEA.did);
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
    expect(post?.record.body).toContain('Page: /@alice.test');
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
    await signedInOnLanyard(page, FEEDBACK);
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
});
