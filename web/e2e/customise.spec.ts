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
      .getByRole('button', { name: 'Move down' })
      .click();
    await expect(
      page.getByText('Links moved to position 2 of 12')
    ).toBeAttached();
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
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(
      lanyardSaves(writes)[0]
        ?.blocks.slice(0, 2)
        .map((block) => block.type)
    ).toEqual(['talks', 'links']);
  });

  test('turns a block off and changes the accent, saving both', async ({
    page,
  }) => {
    await openCustomiser(page);
    await page.getByRole('switch', { name: 'Show Talks' }).click();
    await page.getByRole('radio', { name: 'Teal' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'teal');
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
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
    await page.getByRole('button', { name: 'Save honorific' }).click();
    await expect(page.getByText('Honorific updated')).toBeVisible();
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
        name: 'More options for Building on ATProto at Example Conf 2024',
      })
      .click();
    await page.getByRole('menuitem', { name: 'Hide this item' }).click();
    await expect(preview.getByText(/Example Conf 2024/)).toBeHidden();
    await expect.poll(() => lanyardSaves(writes).length).toBe(1);
    expect(lanyardSaves(writes)[0]?.hidden).toHaveLength(1);

    await page
      .getByRole('region', { name: 'Hidden items' })
      .getByRole('button', { name: 'Show again' })
      .click();
    await expect(preview.getByText(/Example Conf 2024/)).toBeVisible();
    await expect.poll(() => lanyardSaves(writes).length).toBe(2);
    expect(lanyardSaves(writes)[1]?.hidden).toEqual([]);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no accessibility violations (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openCustomiser(page);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
      ).toBeVisible();
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(result.violations).toEqual([]);
    });
  }
});
