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

  test('moves a block with Move down and saves the order', async ({ page }) => {
    await openCustomiser(page);
    const editor = page.getByRole('region', { name: 'Blocks' });
    await editor
      .getByRole('listitem', { name: 'Links' })
      .getByRole('button', { name: 'Move Links down' })
      .click();
    await expect(
      page.getByText('Links moved to position 2 of 12')
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
    ).toEqual(['talks', 'links']);
  });

  test('reorders blocks with the keyboard alone', async ({ page }) => {
    await openCustomiser(page);
    const editor = page.getByRole('region', { name: 'Blocks' });
    await editor.getByRole('button', { name: 'Reorder Links' }).focus();
    // Each step waits for its announcement, as a screen-reader user would.
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Picked up Links, at position 1 of 12.')
    ).toBeAttached();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByText('Links is over position 2 of 12.')
    ).toBeAttached();
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Links moved to position 2 of 12')
    ).toBeAttached();
    await expect(editor.getByRole('listitem').first()).toHaveAttribute(
      'data-block',
      'talks'
    );
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]
        ?.blocks.slice(0, 2)
        .map((block) => block.type)
    ).toEqual(['talks', 'links']);
  });

  test('moves blocks without animation when motion is reduced', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openCustomiser(page);
    const editor = page.getByRole('region', { name: 'Blocks' });
    await editor.getByRole('button', { name: 'Reorder Links' }).focus();
    await page.keyboard.press('Space');
    await expect(
      page.getByText('Picked up Links, at position 1 of 12.')
    ).toBeAttached();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByText('Links is over position 2 of 12.')
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
      page.getByText('Links moved to position 2 of 12')
    ).toBeAttached();
  });

  test('gives every edit link a 44 px target', async ({ page }) => {
    // An empty block shows its edit links in the editor as well.
    await mockPerson(page, {
      sifa: { presentations: [], presentationDeliveries: [] },
    });
    await openCustomiser(page);
    const name = /^Edit (on|in) /;
    const editor = page.getByRole('region', { name: 'Blocks' });
    const preview = page.getByRole('region', { name: 'Preview' });
    await expect(editor.getByRole('link', { name }).first()).toBeVisible();
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
    await page.getByRole('radio', { name: 'Teal' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'teal');
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    await saveChanges(page);
    await expect(page.getByText('All changes saved')).toBeVisible();
    const saves = lanyardSaves(writes);
    expect(saves).toHaveLength(1);
    expect(saves[0]?.accent).toBe('teal');
    expect(saves[0]?.blocks.find((block) => block.type === 'talks')).toEqual({
      type: 'talks',
      visible: false,
    });
  });

  test('sets the honorific', async ({ page }) => {
    await openCustomiser(page);
    const honorific = page.getByRole('group', { name: 'Honorific' });
    await expect(honorific.getByRole('radio', { name: 'Dr' })).toBeChecked();
    await honorific.getByRole('radio', { name: 'Prof' }).check();
    const save = page.getByRole('button', { name: 'Save honorific' });
    await save.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Honorific updated')).toBeVisible();
    await expect(save).toBeFocused();
    const saved = writes.find(
      (write) =>
        write.body.collection === 'app.lanyards.actor.biography.honorific'
    );
    expect(saved?.method).toBe('putRecord');
    expect(saved?.body).toMatchObject({
      rkey: 'self',
      record: { value: 'Prof', createdAt: '2025-11-20T09:00:00.000Z' },
    });
  });

  test('checks a web link, then adds it once fixed', async ({ page }) => {
    await openCustomiser(page);
    const links = page.getByRole('region', { name: 'Your links' });
    const address = links.getByRole('textbox', { name: 'Web address' });
    await address.fill('ftp://x');
    await links.getByRole('button', { name: 'Add link' }).click();
    await expect(address).toHaveAttribute('aria-invalid', 'true');
    await expect(address).toBeFocused();
    await expect(
      links.getByText('Enter a web address starting with https:// or http://')
    ).toBeVisible();

    await address.fill('https://ada.example/talks');
    await links.getByRole('textbox', { name: 'Title' }).fill('Talks');
    await links.getByRole('button', { name: 'Add link' }).click();
    await expect(page.getByText('Link added')).toBeVisible();
    await expect(address).toHaveValue('');
    expect(
      writes.find((write) => write.body.collection === 'app.lanyards.link.web')
        ?.body.record
    ).toMatchObject({ url: 'https://ada.example/talks', title: 'Talks' });
  });

  test('hides an item from the preview and shows it again', async ({
    page,
  }) => {
    await openCustomiser(page);
    const preview = page.getByRole('region', { name: 'Preview' });
    await preview
      .getByRole('button', {
        name: 'Hide Building on ATProto at Example Conf 2024',
      })
      .click();
    await expect(preview.getByText(/Example Conf 2024/)).toBeHidden();
    const hidden = page.getByRole('region', { name: 'Hidden items' });
    const showAgain = hidden.getByRole('button', { name: 'Show again' });
    await expect(showAgain).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(lanyardSaves(writes)[0]?.hidden).toHaveLength(1);

    await showAgain.focus();
    await page.keyboard.press('Enter');
    await expect(preview.getByText(/Example Conf 2024/)).toBeVisible();
    await expect(hidden.getByText('No items are hidden.')).toBeFocused();
    await saveChanges(page);
    await expect.poll(() => lanyardSaves(writes).length).toBe(2);
    expect(lanyardSaves(writes)[1]?.hidden).toEqual([]);
  });

  test('switches to View as public and back', async ({ page }) => {
    await openCustomiser(page);
    const sidebar = page.getByRole('complementary', { name: 'Style' });
    await expect(sidebar).toBeVisible();
    await page.getByRole('button', { name: 'View as public' }).click();
    await expect(sidebar).toBeHidden();
    await expect(
      page.getByText('You’re seeing your lanyard as the public sees it.')
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'More settings' })
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'View as public' })
    ).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(sidebar).toBeVisible();
  });

  test('asks before leaving unsaved changes: a link, Back and reload', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page.getByRole('link', { name: 'My lanyard' }).click();
    await expect(
      page.getByRole('button', { name: 'Reorder Links' })
    ).toBeEnabled();
    await page.getByRole('radio', { name: 'Teal' }).click();

    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.type());
      void dialog.dismiss();
    });
    await page.getByRole('link', { name: 'Lanyards' }).click();
    await page.goBack();
    await expect.poll(() => dialogs).toEqual(['confirm', 'confirm']);
    await expect(page).toHaveURL(/\/lanyard$/);
    // Dismissing the prompt cancels the reload, so don't wait for a load.
    await page.evaluate(() => window.location.reload());
    await expect.poll(() => dialogs).toContain('beforeunload');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'teal');
  });

  test('never hides keyboard focus under the phone toolbar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    const toolbar = page.getByRole('toolbar', { name: 'Customiser' });
    const hidden: string[] = [];
    for (let step = 0; step < 120; step += 1) {
      await page.keyboard.press('Tab');
      const covered = await page.evaluate(() => {
        const focused = document.activeElement as HTMLElement | null;
        const bar = document.querySelector('[role="toolbar"]');
        if (!focused || !bar || bar.contains(focused)) return null;
        // Tabbing past the last control returns to the page itself.
        if (focused === document.body) return null;
        if (focused.closest('header')) return null;
        const { bottom } = focused.getBoundingClientRect();
        const { top } = bar.getBoundingClientRect();
        return bottom > top + 0.5
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

  test('opens the style sheet on a phone (390 × 844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCustomiser(page);
    await expect(
      page.getByRole('complementary', { name: 'Style' })
    ).toBeHidden();
    const toolbar = page.getByRole('toolbar', { name: 'Customiser' });
    const style = toolbar.getByRole('button', { name: 'Style' });
    await style.click();
    const sheet = page.getByRole('dialog', { name: 'Style' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('radio', { name: 'Teal' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'teal');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(style).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(390);
  });

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
