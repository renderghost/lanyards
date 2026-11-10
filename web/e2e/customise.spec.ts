import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { ADA, mockOwnerWrites, mockPerson, signIn } from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GRANULAR =
  'atproto include:app.lanyards.authFull repo:app.bsky.graph.follow?action=create&action=delete rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview';

type SavedRecord = { record: { blocks: { type: string }[] } };

test.describe('lanyard customiser', () => {
  test.beforeEach(async ({ page }) => {
    await mockPerson(page);
    await signIn(page, { did: ADA.did, scope: GRANULAR });
  });

  test('reorders blocks with the keyboard alone', async ({ page }) => {
    const saved = await mockOwnerWrites(page);
    await page.goto('/lanyard');
    const editor = page.getByRole('region', { name: 'Blocks' });
    const handle = editor.getByRole('button', { name: 'Reorder Links' });
    await expect(handle).toBeEnabled();
    await handle.focus();
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
    await expect.poll(() => saved.length, { timeout: 5000 }).toBe(1);
    const { record } = saved[0] as SavedRecord;
    expect(record.blocks.slice(0, 2).map((block) => block.type)).toEqual([
      'talks',
      'links',
    ]);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no accessibility violations (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/lanyard');
      await expect(
        page.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Reorder Links' })
      ).toBeEnabled();
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(result.violations).toEqual([]);
    });
  }
});
