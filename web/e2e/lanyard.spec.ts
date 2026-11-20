import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { ADA, BEA, mockPerson, mockViewer, signIn } from './mocks';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GRANULAR =
  'atproto include:app.lanyards.authFull repo:app.bsky.graph.follow?action=create&action=delete rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview';

const badge = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { level: 1, name: 'Dr Ada Example' });

test.describe('public lanyard, signed out', () => {
  test('shows the badge, links and Bluesky follow link', async ({ page }) => {
    await mockPerson(page);
    await page.goto('/@alice.test');
    await expect(badge(page)).toBeVisible();
    const links = page.getByRole('region', { name: 'Links' });
    await expect(
      links.getByRole('link', { name: 'GitHub (opens in a new tab)' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Follow on Bluesky (opens in a new tab)' })
    ).toHaveAttribute('href', 'https://bsky.app/profile/alice.test');
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const accent of ['mint', 'blue'] as const) {
      test(`has no accessibility violations (${colorScheme}, ${accent})`, async ({
        page,
      }) => {
        await mockPerson(page, {
          config: {
            accent,
            blocks: [
              { type: 'links', visible: true },
              { type: 'openTo', visible: true },
              { type: 'talks', visible: true },
              { type: 'skills', visible: true },
            ],
          },
        });
        await page.emulateMedia({ colorScheme });
        await page.goto('/@alice.test');
        await expect(page.getByRole('region', { name: 'Talks' })).toBeVisible();
        await expect(
          page.getByRole('region', { name: 'Open to' })
        ).toBeVisible();
        const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        expect(result.violations).toEqual([]);
      });
    }
  }

  test('fits a 320px-wide screen without sideways scrolling', async ({
    page,
  }) => {
    await mockPerson(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/@alice.test');
    await expect(badge(page)).toBeVisible();
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(width).toBeLessThanOrEqual(320);
  });

  test('fits 320px even with long unbroken pronouns and skill names', async ({
    page,
  }) => {
    const unbroken = 'x'.repeat(64);
    await mockPerson(page, {
      sifa: {
        pronouns: unbroken,
        openTo: ['id.sifa.defs#mentoringOthers'],
        skills: [{ rkey: 's1', name: `Skill${'y'.repeat(120)}` }],
      },
      config: {
        blocks: [
          { type: 'skills', visible: true },
          { type: 'openTo', visible: true },
        ],
      },
    });
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/@alice.test');
    await expect(page.getByRole('region', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText(unbroken)).toBeVisible();
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(width).toBeLessThanOrEqual(320);
  });

  test('redirects an encoded @ to the canonical URL', async ({ page }) => {
    await mockPerson(page);
    await page.goto('/%40alice.test');
    await expect(page).toHaveURL('/@alice.test');
    await expect(badge(page)).toBeVisible();
  });

  test('offers search for a handle that does not exist', async ({ page }) => {
    await mockPerson(page);
    await page.route(
      'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead**',
      (route) => route.fulfill({ json: { actors: [] } })
    );
    await page.goto('/@nobody.test');
    await expect(
      page.getByRole('heading', { name: "We couldn't find @nobody.test" })
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Search for someone' })
    ).toBeVisible();
  });

  test('respects an opt-out from logged-out viewing', async ({ page }) => {
    await mockPerson(page, { labels: ['!no-unauthenticated'] });
    await page.goto('/@alice.test');
    await expect(
      page.getByText(
        'This person has chosen to show their lanyard only to people who are signed in.'
      )
    ).toBeVisible();
    await expect(badge(page)).toHaveCount(0);
  });

  test('keeps the badge when Sifa is down, hiding its blocks', async ({
    page,
  }) => {
    await mockPerson(page, { sifaDown: true });
    await page.goto('/@alice.test');
    // The title comes from Sifa: without it, the name stands alone.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Ada Example' })
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Links' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Talks' })).toHaveCount(0);
  });
});

test.describe('public lanyard, signed in', () => {
  test('follows and unfollows', async ({ page }) => {
    await mockPerson(page);
    const writes = await mockViewer(page);
    await signIn(page, { did: BEA.did, scope: GRANULAR });
    await page.goto(`/d/${ADA.did}`);
    const follow = page.getByRole('button', { name: 'Follow' });
    await expect(follow).toBeEnabled();
    await follow.click();
    await expect(page.getByRole('button', { name: 'Following' })).toBeEnabled();
    expect(writes.created).toEqual([
      expect.objectContaining({
        repo: BEA.did,
        collection: 'app.bsky.graph.follow',
        record: expect.objectContaining({
          $type: 'app.bsky.graph.follow',
          subject: ADA.did,
        }),
      }),
    ]);
    await page.getByRole('button', { name: 'Following' }).click();
    await expect(page.getByRole('button', { name: 'Follow' })).toBeEnabled();
    expect(writes.deleted).toEqual([
      { repo: BEA.did, collection: 'app.bsky.graph.follow', rkey: '3mnew' },
    ]);
  });

  test('fits 320px when a known follower has a long unbroken name', async ({
    page,
  }) => {
    const unbroken = 'z'.repeat(80);
    await mockPerson(page);
    await mockViewer(page, {
      knownFollowers: [
        {
          did: 'did:plc:fixturecalaaaaaaaaaaaaaaa',
          handle: 'cal.test',
          displayName: unbroken,
        },
      ],
    });
    await signIn(page, { did: BEA.did, scope: GRANULAR });
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/@alice.test');
    await expect(
      page.getByRole('list', { name: 'What you share' })
    ).toContainText(unbroken);
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(width).toBeLessThanOrEqual(320);
  });

  test('asks for permission instead of writing with an identity-only session', async ({
    page,
  }) => {
    await mockPerson(page);
    const writes = await mockViewer(page);
    await signIn(page, { did: BEA.did, scope: 'atproto' });
    await page.goto('/@alice.test');
    await page.getByRole('button', { name: 'Follow' }).click();
    await expect(
      page.getByRole('heading', { name: 'Lanyards needs your permission' })
    ).toBeFocused();
    expect(writes.created).toEqual([]);
  });
});

test.describe('pills at 320 px', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('long pill labels truncate inside their pills', async ({ page }) => {
    await mockPerson(page, {
      config: {
        blocks: [
          { type: 'links', visible: true },
          { type: 'skills', visible: true },
        ],
      },
      sifa: {
        externalAccounts: [
          {
            rkey: '3mlong',
            url: 'https://long.example/',
            platform: 'website',
            label: 'A very long link title '.repeat(5).trim(),
            primary: false,
            verified: false,
            verifiable: false,
          },
        ],
        skills: [
          {
            rkey: '3mlongskill',
            name: 'Supercalifragilisticexpialidocious'.repeat(3),
            category: 'technical',
            endorsed: false,
            endorsementCount: 0,
          },
        ],
      },
    });
    await page.goto('/@alice.test');
    await expect(page.getByRole('region', { name: 'Skills' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(320);
  });
});

test.describe('cards', () => {
  test('Tab reaches one link per card, and the card shows the focus ring', async ({
    page,
  }) => {
    await mockPerson(page);
    await page.goto('/@alice.test');
    const talks = page.getByRole('region', { name: 'Talks' });
    await expect(talks).toBeVisible();
    // Every card holds at most one link.
    const perCard = await talks
      .locator('[data-card]')
      .evaluateAll((cards) =>
        cards.map((card) => card.querySelectorAll('a').length)
      );
    expect(perCard.length).toBeGreaterThan(1);
    expect(Math.max(...perCard)).toBeLessThanOrEqual(1);
    const links = talks.locator('[data-card] a');
    const count = await links.count();
    expect(count).toBeGreaterThan(1);
    await links.first().focus();
    for (let index = 1; index < count; index += 1) {
      await page.keyboard.press('Tab');
      await expect(links.nth(index)).toBeFocused();
    }
    const outline = await links.first().evaluate((link) => {
      (link as HTMLElement).focus();
      return getComputedStyle(link.closest('[data-card]')!).outlineStyle;
    });
    expect(outline).not.toBe('none');
  });

  test('a click on a card opens it; dragging selects its text instead', async ({
    page,
  }) => {
    await mockPerson(page);
    await page.goto('/@alice.test');
    const talks = page.getByRole('region', { name: 'Talks' });
    const card = talks.locator('[data-card]:has(a)').first();
    await expect(card).toBeVisible();
    // Count the link's clicks without leaving the page.
    await card.locator('a').evaluate((link) => {
      (window as unknown as { opened: number }).opened = 0;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        (window as unknown as { opened: number }).opened += 1;
      });
    });
    const opened = () =>
      page.evaluate(() => (window as unknown as { opened: number }).opened);
    const meta = card.locator('p').last();
    await meta.click();
    expect(await opened()).toBe(1);
    const box = (await meta.boundingBox())!;
    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, {
      steps: 5,
    });
    await page.mouse.up();
    expect(
      await page.evaluate(() => window.getSelection()?.toString())
    ).not.toBe('');
    expect(await opened()).toBe(1);
    expect(await card.evaluate((el) => getComputedStyle(el).cursor)).toBe(
      'pointer'
    );
    const linkless = talks.locator('[data-card]:not(:has(a))');
    if ((await linkless.count()) > 0) {
      expect(
        await linkless.first().evaluate((el) => getComputedStyle(el).cursor)
      ).not.toBe('pointer');
    }
  });
});
