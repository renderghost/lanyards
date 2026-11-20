import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import {
  ADA,
  mockOwnerWrites,
  mockPerson,
  type OwnerWrite,
  signIn,
} from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GRANULAR =
  'atproto include:app.lanyards.authFull repo:app.bsky.graph.follow?action=create&action=delete rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview';
const LANYARD = 'app.lanyards.actor.lanyard';

type Lanyard = {
  accent?: string;
  badge?: { cover?: string; showRole?: boolean };
  blocks: { type: string; visible: boolean }[];
  hidden: string[];
};

const lanyardSaves = (writes: OwnerWrite[]) =>
  writes
    .filter((write) => write.body.collection === LANYARD)
    .map((write) => write.body.record as unknown as Lanyard);

/** Presses the customiser's Save. */
async function saveChanges(page: Page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

/** Opens the customiser once its controls can save. */
async function openCustomiser(page: Page) {
  await page.goto('/lanyard');
  await expect(
    page.getByRole('button', { name: 'Reorder Links' })
  ).toBeEnabled();
}

test.describe('lanyard customiser', () => {
  let writes: OwnerWrite[];

  test.beforeEach(async ({ page }) => {
    await mockPerson(page);
    writes = await mockOwnerWrites(page);
    await signIn(page, { did: ADA.did, scope: GRANULAR });
  });

  test('moves a block with Move down and saves the order on Save', async ({
    page,
  }) => {
    await openCustomiser(page);
    const editor = page.getByRole('list', { name: 'Blocks' });
    await editor
      .getByRole('listitem', { name: 'Links' })
      .getByRole('button', { name: 'Move Links down' })
      .click();
    await expect(
      page.getByText('Links moved to position 2 of 13')
    ).toBeAttached();
    await expect(
      editor.getByRole('button', { name: 'Move Links down' })
    ).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]
        ?.blocks.slice(0, 2)
        .map((block) => block.type)
    ).toEqual(['roles', 'links']);
  });

  test('hides a role in place and saves it (#130)', async ({ page }) => {
    await openCustomiser(page);
    const roles = page.getByRole('region', { name: 'Roles' });
    await roles.getByRole('button', { name: 'Hide Visiting Fellow' }).click();
    await expect(
      roles.getByRole('button', { name: 'Show Visiting Fellow' })
    ).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(lanyardSaves(writes)[0]?.hidden).toContain(
      `at://${ADA.did}/id.sifa.profile.position/3mpos2`
    );
  });

  // Final review I1: a hidden role in the editor, on a phone.
  test('keeps a hidden role readable on a phone (#130)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    const roles = page.getByRole('region', { name: 'Roles' });
    await roles
      .getByRole('button', { name: 'Hide Software Developer' })
      .click();
    const title = roles.getByText('Software Developer', { exact: true });
    expect((await title.boundingBox())!.width).toBeGreaterThanOrEqual(120);
    const overflow = await roles.evaluate(
      (element) => element.scrollWidth - element.clientWidth
    );
    expect(overflow).toBe(0);
  });

  test('reorders blocks with the keyboard alone', async ({ page }) => {
    await openCustomiser(page);
    const editor = page.getByRole('list', { name: 'Blocks' });
    await editor.getByRole('button', { name: 'Reorder Links' }).focus();
    // Each step waits for its announcement, as a screen-reader user would.
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Picked up Links, at position 1 of 13.')
    ).toBeAttached();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByText('Links is over position 2 of 13.')
    ).toBeAttached();
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Links moved to position 2 of 13')
    ).toBeAttached();
    await expect(editor.getByRole('listitem').first()).toHaveAttribute(
      'data-block',
      'roles'
    );
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]
        ?.blocks.slice(0, 2)
        .map((block) => block.type)
    ).toEqual(['roles', 'links']);
  });

  test('moves blocks without animation when motion is reduced', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openCustomiser(page);
    const editor = page.getByRole('list', { name: 'Blocks' });
    await editor.getByRole('button', { name: 'Reorder Links' }).focus();
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Picked up Links, at position 1 of 13.')
    ).toBeAttached();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByText('Links is over position 2 of 13.')
    ).toBeAttached();
    const animated = await editor.getByRole('listitem').evaluateAll((rows) =>
      rows.filter((row) => {
        const style = getComputedStyle(row);
        return (
          style.transitionProperty !== 'none' &&
          style.transitionDuration
            .split(',')
            .some((duration) => Number.parseFloat(duration) > 0)
        );
      })
    );
    expect(animated).toHaveLength(0);
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Links moved to position 2 of 13')
    ).toBeAttached();
  });

  test('gives every edit link a 44 px target', async ({ page }) => {
    // An empty block shows its edit links in the editor as well.
    await mockPerson(page, {
      sifa: { presentations: [], presentationDeliveries: [] },
    });
    await openCustomiser(page);
    const name = /^Edit (on|in) /;
    const preview = page.getByRole('region', { name: 'Preview' });
    await expect(preview.getByRole('link', { name }).first()).toBeVisible();
    const heights = await page
      .getByRole('link', { name })
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height)
      );
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  });

  test('turns a block off and changes the accent, saving both', async ({
    page,
  }) => {
    await openCustomiser(page);
    await page.getByRole('switch', { name: 'Show Talks' }).click();
    await page.getByRole('radio', { name: 'Mint' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'mint');
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await saveChanges(page);
    await expect(page.getByText('All changes saved')).toBeVisible();
    const saves = lanyardSaves(writes);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.accent).toBe('mint');
    expect(saves[0]?.blocks.find((block) => block.type === 'talks')).toEqual({
      type: 'talks',
      visible: false,
    });
  });

  test('picks a cover in Style and saves it (#129)', async ({ page }) => {
    await openCustomiser(page);
    await page.getByRole('button', { name: 'Cover' }).click();
    // Ada's cover until she picks one comes from her DID: Pixels.
    await expect(page.getByRole('radio', { name: 'Pixels' })).toBeChecked();
    await page.getByRole('radio', { name: 'Hazard' }).click();
    await expect(page.getByRole('radio', { name: 'Hazard' })).toBeChecked();
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await saveChanges(page);
    await expect(page.getByText('All changes saved')).toBeVisible();
    const saves = lanyardSaves(writes);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.badge).toMatchObject({ cover: 'hazard' });
  });

  test('adds a podcast in the dialog and saves it', async ({ page }) => {
    await openCustomiser(page);
    await page
      .getByRole('switch', { name: 'Show Podcasts and videos' })
      .click();
    const media = page.locator('[data-block="media"]');
    const add = media.getByRole('button', { name: 'Add a podcast or video' });
    await expect(add).toBeEnabled();
    await add.click();
    const dialog = page.getByRole('dialog', { name: 'Add a podcast or video' });
    // The form starts with the kind of media.
    await expect(dialog.getByRole('radio', { name: 'Audio' })).toBeFocused();
    const address = dialog.getByRole('textbox', { name: 'Web address' });
    await address.fill('https://pod.example/new');
    await dialog
      .getByRole('combobox', { name: 'Platform' })
      .selectOption('spotify');
    await dialog.getByRole('textbox', { name: 'Title' }).fill('New episode');
    await dialog.getByRole('button', { name: 'Add media' }).click();
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();
    await expect(
      media.getByRole('link', { name: 'New episode' })
    ).toBeVisible();
    expect(writes.filter((write) => write.method === 'applyWrites')).toEqual(
      []
    );
    await saveChanges(page);
    await expect(page.getByText('Lanyard updated')).toBeVisible();
    const saved = writes.find(
      (write) => write.body.collection === 'app.lanyards.media.item'
    );
    expect(saved?.body).toMatchObject({
      action: 'create',
      record: {
        url: 'https://pod.example/new',
        kind: 'audio',
        platform: 'spotify',
        title: 'New episode',
      },
    });
  });

  test('moves a legacy podcast to the new record type when opened', async ({
    page,
  }) => {
    const legacy = `at://${ADA.did}/app.lanyards.link.media.audio/3mlegacy`;
    await mockPerson(page, {
      config: { blocks: [{ type: 'media', visible: true }], hidden: [] },
      legacyAudio: [
        {
          uri: legacy,
          cid: `bafyrei${'b'.repeat(52)}`,
          value: {
            $type: 'app.lanyards.link.media.audio',
            url: 'https://pod.example/legacy',
            platform: 'spotify',
            title: 'Legacy episode',
            createdAt: '2025-01-01T09:00:00.000Z',
          },
        },
      ],
    });
    await openCustomiser(page);
    await expect(
      page.getByText('Your podcasts and videos were updated to the new format.')
    ).toBeVisible();
    expect(writes).toEqual(
      expect.arrayContaining([
        {
          method: 'applyWrites',
          body: expect.objectContaining({
            collection: 'app.lanyards.media.item',
            action: 'create',
            rkey: '3mlegacy',
            record: expect.objectContaining({
              kind: 'audio',
              url: 'https://pod.example/legacy',
            }),
          }),
        },
        {
          method: 'applyWrites',
          body: expect.objectContaining({
            collection: 'app.lanyards.link.media.audio',
            action: 'delete',
            rkey: '3mlegacy',
          }),
        },
      ])
    );
    await expect(
      page
        .locator('[data-block="media"]')
        .getByRole('link', { name: /Legacy episode/ })
    ).toBeVisible();
  });

  test('hides a record in place, then shows it again', async ({ page }) => {
    await openCustomiser(page);
    const talks = page.locator('[data-block="talks"]');
    await talks
      .getByRole('button', {
        name: 'Hide Building on ATProto at Example Conf 2024',
      })
      .click();
    await expect(talks.getByText(/Example Conf 2024/)).toBeVisible();
    await expect(talks.getByText('Hidden', { exact: true })).toBeVisible();
    const show = talks.getByRole('button', {
      name: 'Show Building on ATProto at Example Conf 2024',
    });
    await expect(show).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(lanyardSaves(writes)[0]?.hidden).toHaveLength(1);

    await show.focus();
    await page.keyboard.press('Enter');
    await expect(talks.getByText('Hidden', { exact: true })).toBeHidden();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(2);
    expect(lanyardSaves(writes)[1]?.hidden).toEqual([]);
  });

  test('hides a block in place and saves it', async ({ page }) => {
    await openCustomiser(page);
    const talks = page.locator('[data-block="talks"]');
    const toggle = talks.getByRole('switch', { name: 'Show Talks' });
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(talks.getByText('Hidden from visitors')).toBeVisible();
    await expect(talks.getByText(/Example Conf 2024/)).toBeHidden();
    await expect(toggle).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]?.blocks.find((block) => block.type === 'talks')
    ).toEqual({ type: 'talks', visible: false });
  });

  test('changes a counted block’s count', async ({ page }) => {
    await openCustomiser(page);
    await page
      .getByRole('combobox', { name: 'Items to show for Social posts' })
      .selectOption('5');
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]?.blocks.find(
        (block) => block.type === 'bskyPosts'
      )
    ).toMatchObject({ type: 'bskyPosts', limit: 5 });
    await expect(
      page.locator('[data-block="talks"]').getByRole('combobox')
    ).toHaveCount(0);
  });

  test('clears hidden entries that are no longer on the lanyard', async ({
    page,
  }) => {
    const gone = `at://${ADA.did}/id.sifa.profile.presentationDelivery/deleted`;
    await mockPerson(page, { config: { hidden: [gone] } });
    await openCustomiser(page);
    const line = page.getByText('1 hidden item is no longer on your lanyard');
    await expect(line).toBeVisible();
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(line).toBeHidden();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(lanyardSaves(writes)[0]?.hidden).toEqual([]);
  });

  test('moves between Customise and View from the top bar (#150)', async ({
    page,
  }) => {
    await openCustomiser(page);
    const sidebar = page.getByRole('complementary', { name: 'Style' });
    await expect(sidebar).toBeVisible();
    const nav = page
      .getByRole('banner')
      .getByRole('navigation', { name: 'Your Lanyards' });
    await expect(nav.getByRole('link', { name: 'Customise' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await nav.getByRole('link', { name: 'View' }).click();
    await expect(page).toHaveURL(/\/alice\.test$/);
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole('switch', { name: 'Show Links' })).toBeHidden();
    await expect(nav.getByRole('link', { name: 'View' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await nav.getByRole('link', { name: 'Customise' }).click();
    await expect(page).toHaveURL(/\/alice\.test\/edit$/);
    await expect(sidebar).toBeVisible();
  });

  test('gives phones a bottom bar, Show QR first among equals (#150)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openCustomiser(page);
    const bar = page.getByRole('navigation', { name: 'Your Lanyards' });
    // Only the bottom bar's: the top bar's links are hidden on phones.
    await expect(bar).toHaveCount(1);
    const box = await bar.boundingBox();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(640, 0);
    const widths: Record<string, number> = {};
    for (const name of ['Customise', 'View', 'Show QR', 'Your account']) {
      const link = bar.getByRole('link', { name });
      await expect(link).toBeVisible();
      widths[name] = (await link.boundingBox())?.width ?? 0;
    }
    expect(widths['Show QR']).toBeGreaterThan(
      Math.max(
        widths.Customise ?? 0,
        widths.View ?? 0,
        widths['Your account'] ?? 0
      )
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(320);
    await bar.getByRole('link', { name: 'Show QR' }).click();
    await expect(page).toHaveURL(/\/alice\.test\/share$/);
  });

  test('asks before leaving unsaved changes: a link, Back and reload', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Customise' })
      .click();
    await expect(
      page.getByRole('button', { name: 'Reorder Links' })
    ).toBeEnabled();
    await page.getByRole('radio', { name: 'Mint' }).click();

    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.type());
      void dialog.dismiss();
    });
    await page.getByRole('link', { name: 'Lanyards' }).click();
    await page.goBack();
    await expect.poll(() => dialogs).toEqual(['confirm', 'confirm']);
    await expect(page).toHaveURL(/\/alice\.test\/edit$/);
    // Dismissing the prompt cancels the reload, so don't wait for a load.
    await page.evaluate(() => window.location.reload());
    await expect.poll(() => dialogs).toContain('beforeunload');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'mint');
  });

  test('never hides keyboard focus under the bottom bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    const toolbar = page.getByRole('navigation', { name: 'Your Lanyards' });
    const hidden: string[] = [];
    for (let step = 0; step < 120; step += 1) {
      await page.keyboard.press('Tab');
      const covered = await page.evaluate(() => {
        const focused = document.activeElement as HTMLElement | null;
        const bar = document.querySelector('[data-bottom-toolbar]');
        if (!focused || !bar || bar.contains(focused)) return null;
        // Tabbing past the last control returns to the page itself.
        if (focused === document.body) return null;
        if (focused.closest('header')) return null;
        // Under the bar, not merely after it: the site footer follows it.
        const control = focused.getBoundingClientRect();
        const { top, bottom } = bar.getBoundingClientRect();
        return control.bottom > top + 0.5 && control.top < bottom - 0.5
          ? (focused.getAttribute('aria-label') ??
              focused.textContent?.trim().slice(0, 40) ??
              focused.tagName)
          : null;
      });
      if (covered) hidden.push(covered);
    }
    await expect(toolbar).toBeVisible();
    expect(hidden).toEqual([]);
  });

  test('names every block in full in its header row at 390 px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    // A hidden counted block: the longest row, with "Hidden from visitors".
    await page.getByRole('switch', { name: 'Show Publications' }).click();
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-block]')].flatMap(
        (block) => {
          const header = block.querySelector<HTMLElement>(
            '[data-block-header]'
          );
          const title = header?.querySelector('h2')?.parentElement;
          const controls = header?.lastElementChild as HTMLElement | null;
          if (!header || !title || !controls) return [block.dataset.block];
          const texts = [...title.children] as HTMLElement[];
          const cut = texts.filter(
            (text) => text.scrollWidth > text.clientWidth + 1
          );
          const a = title.getBoundingClientRect();
          const b = controls.getBoundingClientRect();
          const overlap =
            a.right > b.left + 1 &&
            a.bottom > b.top + 1 &&
            b.bottom > a.top + 1;
          return cut.length > 0 || overlap ? [block.dataset.block] : [];
        }
      )
    );
    expect(clipped).toEqual([]);
  });

  test('pill links in the editor are 44 px targets at 390 px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    const heights = await page
      .locator('[data-block="links"] [data-hidden], [data-block="links"] li a')
      .evaluateAll((links) =>
        links
          .filter((link) => link.tagName === 'A')
          .map((link) => link.getBoundingClientRect().height)
      );
    expect(heights.length).toBeGreaterThan(0);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  });

  test('a hidden card keeps its text readable at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openCustomiser(page);
    const talks = page.locator('[data-block="talks"]');
    await talks
      .getByRole('button', { name: /^Hide / })
      .first()
      .click();
    const width = await talks
      .locator('[data-card][data-hidden] [data-card-content]')
      .evaluate((content) => content.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(150);
  });

  test('opens the style sheet on a phone (390 × 844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    await expect(
      page.getByRole('complementary', { name: 'Style' })
    ).toBeHidden();
    // On phones, Style is in the top bar (#150).
    const style = page
      .getByRole('banner')
      .getByRole('button', { name: 'Style' });
    await style.click();
    const sheet = page.getByRole('dialog', { name: 'Style' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('radio', { name: 'Mint' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'mint');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(style).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(390);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`stays accessible with hidden records and blocks (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openCustomiser(page);
      const talks = page.locator('[data-block="talks"]');
      await talks
        .getByRole('button', {
          name: 'Hide Building on ATProto at Example Conf 2024',
        })
        .click();
      await expect(talks.getByText('Hidden', { exact: true })).toBeVisible();
      await page.getByRole('switch', { name: 'Show Links' }).click();
      await expect(
        page.locator('[data-block="links"]').getByText('Hidden from visitors')
      ).toBeVisible();
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(result.violations).toEqual([]);
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`stays accessible with the podcast dialog open (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openCustomiser(page);
      await page
        .getByRole('switch', { name: 'Show Podcasts and videos' })
        .click();
      await page
        .getByRole('button', { name: 'Add a podcast or video' })
        .click();
      const dialog = page.getByRole('dialog', {
        name: 'Add a podcast or video',
      });
      await dialog.getByRole('button', { name: 'Add media' }).click();
      await expect(
        dialog.getByRole('textbox', { name: 'Web address' })
      ).toHaveAttribute('aria-invalid', 'true');
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(result.violations).toEqual([]);
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no accessibility violations (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openCustomiser(page);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Dr Ada Example' })
      ).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Customise your lanyard'
      );
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(result.violations).toEqual([]);
    });
  }
});

test.describe('lanyard customiser on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await mockPerson(page);
    await mockOwnerWrites(page);
    await signIn(page, { did: ADA.did, scope: GRANULAR });
  });

  test('a swipe from a handle moves nothing; press and hold drags', async ({
    page,
  }) => {
    await openCustomiser(page);
    const cdp = await page.context().newCDPSession(page);
    const touch = (
      type: 'touchStart' | 'touchMove' | 'touchEnd',
      x?: number,
      y?: number
    ) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: x === undefined || y === undefined ? [] : [{ x, y }],
      });
    const handle = page.getByRole('button', { name: 'Reorder Links' });
    await handle.scrollIntoViewIfNeeded();
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    // A quick swipe that starts on the handle picks nothing up.
    await touch('touchStart', x, y);
    for (let step = 1; step <= 6; step += 1) {
      await touch('touchMove', x, y - step * 30);
    }
    await touch('touchEnd');
    await expect(page.getByText(/^Picked up/)).toHaveCount(0);

    // Press and hold, then drag Links onto Talks, the next block: measured,
    // since how far that is depends on how much the badge scrolled away.
    const next = (await page
      .getByRole('button', { name: 'Reorder Talks' })
      .boundingBox())!;
    const distance = next.y + next.height / 2 + 40 - y;
    await touch('touchStart', x, y);
    await page.waitForTimeout(400);
    for (let step = 1; step <= 10; step += 1) {
      await touch('touchMove', x, y + (step * distance) / 10);
      await page.waitForTimeout(16);
    }
    await touch('touchEnd');
    await expect(
      page.getByText(/^Links moved to position \d+ of 13$/)
    ).toBeAttached();
    const order = await page
      .getByRole('list', { name: 'Blocks' })
      .evaluate((list) =>
        [...list.children].map((child) => (child as HTMLElement).dataset.block)
      );
    expect(order[0]).not.toBe('links');
    expect(order).toContain('links');
  });
});
