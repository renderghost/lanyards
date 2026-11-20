import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { server } from '@/test/msw';
import { mockListRecords } from '@/test/handlers';
import { ADA } from '@/test/people';
import {
  servePerson,
  signedInSession,
  signedOutSession,
  VIEWER_PDS,
} from '@/test/person';
import { renderRoute, waitForRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const CID = `bafyrei${'a'.repeat(52)}`;

/** Records every putRecord the customiser sends. */
function captureSaves() {
  const saves: Record<string, unknown>[] = [];
  server.use(
    http.post(
      `${VIEWER_PDS}/xrpc/com.atproto.repo.putRecord`,
      async ({ request }) => {
        saves.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({
          uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
          cid: CID,
        });
      }
    )
  );
  return saves;
}

type Write = {
  $type: string;
  collection: string;
  rkey?: string;
  value?: Record<string, unknown>;
};

/** Records every applyWrites batch the customiser sends. */
function captureWrites() {
  const batches: Write[][] = [];
  server.use(
    http.post(
      `${VIEWER_PDS}/xrpc/com.atproto.repo.applyWrites`,
      async ({ request }) => {
        const body = (await request.json()) as { writes: Write[] };
        batches.push(body.writes);
        return HttpResponse.json({ results: [] });
      }
    )
  );
  return batches;
}

/** The Links block on the lanyard. */
const linksBlock = async () => {
  const region = await preview();
  return within(region).findByRole(
    'listitem',
    { name: 'Links' },
    { timeout: 5000 }
  );
};

/** Waits until a kept-record control can be used. */
async function enabled(name: string) {
  const button = await screen.findByRole('button', { name }, { timeout: 8000 });
  await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled'), {
    timeout: 5000,
  });
  await waitFor(() => expect(button).toBeEnabled(), { timeout: 5000 });
  return button;
}

const sifaDown = () =>
  server.use(
    http.get('https://sifa.id/xrpc/id.sifa.getProfileView', () =>
      HttpResponse.json({}, { status: 500 })
    ),
    http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, ({ request }) =>
      new URL(request.url).searchParams.get('collection')?.startsWith('id.sifa')
        ? HttpResponse.json({}, { status: 500 })
        : undefined
    )
  );

const preview = () =>
  screen.findByRole('region', { name: 'Preview' }, { timeout: 5000 });

const accent = (name: string) => screen.findByRole('radio', { name });

/** Opens the style sidebar's Badge section; returns its job checkbox. */
async function jobCheckbox() {
  const sidebar = await screen.findByRole(
    'complementary',
    { name: 'Style' },
    { timeout: 5000 }
  );
  await userEvent.click(within(sidebar).getByRole('button', { name: 'Badge' }));
  return within(sidebar).getByRole('checkbox', { name: 'Show current job' });
}

/** Presses the customiser's Save. */
const saveChanges = () =>
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  document.documentElement.dataset.accent = 'blue';
});

// Lazily loaded routes and Sifa's retry-then-fallback path take a few
// seconds under a full parallel run.
describe('/lanyard', { timeout: 20_000 }, () => {
  it('sends signed-out visitors to sign in first', async () => {
    vi.mocked(useSession).mockReturnValue(signedOutSession());
    const { router } = renderRoute('/lanyard');
    await waitForRoute(router, '/?returnTo=%2Flanyard', 5000);
  });

  it('previews the owner’s lanyard as the owner sees it', async () => {
    servePerson();
    sifaDown();
    renderRoute('/lanyard');
    const region = await preview();
    // The title comes from Sifa: without it, the name stands alone.
    expect(
      await within(region).findByRole(
        'heading',
        { level: 2, name: 'Ada Example' },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
    expect(
      await within(region).findAllByText("Couldn't load Sifa", undefined, {
        timeout: 8000,
      })
    ).not.toHaveLength(0);
    expect(document.title).toBe('Your lanyard · Lanyards');
  });

  it('the lanyard sits on its own ground, with no box round it', async () => {
    servePerson();
    const { container } = renderRoute('/lanyard');
    const region = await preview();
    await within(region).findByRole(
      'heading',
      { level: 2, name: 'Dr Ada Example' },
      { timeout: 5000 }
    );
    const grounds = () =>
      container.querySelectorAll<HTMLElement>('[data-lanyard-surface]');
    // One ground: the canvas itself, holding the heading and the lanyard.
    expect(grounds()).toHaveLength(1);
    const [ground] = grounds();
    expect(ground).toContainElement(region);
    expect(ground).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'Customise your lanyard' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'View as public' })
    );
    await within(await preview()).findByRole(
      'heading',
      { level: 2, name: 'Dr Ada Example' },
      { timeout: 5000 }
    );
    expect(grounds()).toHaveLength(1);
  });

  it('shows only its own header, with the customiser’s actions', async () => {
    servePerson();
    renderRoute('/lanyard');
    await preview();
    const banners = screen.getAllByRole('banner');
    expect(banners).toHaveLength(1);
    expect(banners[0]).toHaveTextContent('Your lanyard');
    expect(
      within(banners[0] as HTMLElement).getByRole('button', { name: 'Save' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('lays the lanyard out beside a pinned style sidebar', async () => {
    servePerson();
    renderRoute('/lanyard');
    const sidebar = await screen.findByRole(
      'complementary',
      { name: 'Style' },
      { timeout: 5000 }
    );
    expect(
      within(sidebar).getByRole('button', { name: 'Accent colour' })
    ).toHaveAttribute('aria-expanded', 'true');
    // Blocks are edited on the lanyard itself.
    expect(
      within(await preview()).getByRole('list', { name: 'Blocks' })
    ).toBeInTheDocument();
    // Links, podcasts and the title are edited there too.
    expect(screen.queryByRole('region', { name: 'More settings' })).toBeNull();
  });

  it('View as public hides the sidebar and edit controls, and Edit brings them back', async () => {
    servePerson();
    renderRoute('/lanyard');
    const region = await preview();
    await within(region).findByRole(
      'button',
      { name: 'Hide Building on ATProto at Example Conf 2024' },
      { timeout: 8000 }
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'View as public' })
    );
    expect(screen.queryByRole('complementary', { name: 'Style' })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Show Links' })).toBeNull();
    expect(
      screen.getByText('You’re seeing your lanyard as the public sees it.')
    ).toBeInTheDocument();
    expect(
      within(await preview()).queryByRole('button', {
        name: /^(Hide|Show) /,
      })
    ).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(
      screen.getByRole('complementary', { name: 'Style' })
    ).toBeInTheDocument();
  });

  it('asks before leaving with unsaved changes', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    servePerson();
    const { router } = renderRoute('/lanyard');
    const mint = await accent('Mint');
    await waitFor(() => expect(mint).toBeEnabled(), { timeout: 5000 });
    await userEvent.click(mint);
    await userEvent.click(screen.getByRole('link', { name: 'Lanyards' }));
    expect(confirm).toHaveBeenCalledWith(
      'You have unsaved changes. Leave without saving?'
    );
    expect(router.state.location.pathname).toBe('/lanyard');
    confirm.mockRestore();
  });

  it('gives the page one level-one heading, its purpose', async () => {
    servePerson();
    renderRoute('/lanyard');
    const region = await preview();
    await within(region).findByRole(
      'heading',
      { level: 2, name: 'Dr Ada Example' },
      { timeout: 5000 }
    );
    expect(
      screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)
    ).toEqual(['Customise your lanyard']);
  });

  it('switches the preview to what visitors see', async () => {
    servePerson();
    sifaDown();
    renderRoute('/lanyard');
    const region = await preview();
    await within(region).findAllByText("Couldn't load Sifa", undefined, {
      timeout: 8000,
    });
    const toggle = screen.getByRole('button', { name: 'View as public' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(within(region).queryAllByText("Couldn't load Sifa")).toHaveLength(0);
  });

  it('applies and saves a new accent, announcing progress', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const mint = await accent('Mint');
    await waitFor(() => expect(mint).toBeEnabled(), { timeout: 5000 });
    await userEvent.click(mint);
    expect(document.documentElement.dataset.accent).toBe('mint');
    const status = within(screen.getByRole('banner')).getByRole('status');
    expect(status).toHaveTextContent('Unsaved changes');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(saves).toEqual([]);
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect(saves[0]).toMatchObject({
      repo: ADA.did,
      collection: 'app.lanyards.actor.lanyard',
      rkey: 'self',
      record: { $type: 'app.lanyards.actor.lanyard', accent: 'mint' },
    });
    await waitFor(() => expect(status).toHaveTextContent('All changes saved'));
  });

  it('resets unsaved changes to the last save, writing nothing', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const mint = await accent('Mint');
    await waitFor(() => expect(mint).toBeEnabled(), { timeout: 5000 });
    const save = screen.getByRole('button', { name: 'Save' });
    const reset = within(screen.getByRole('banner')).getByRole('button', {
      name: 'Reset',
    });
    expect(save).toHaveAttribute('aria-disabled', 'true');
    expect(reset).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(mint);
    expect(save).not.toHaveAttribute('aria-disabled');
    await userEvent.click(reset);
    expect(document.documentElement.dataset.accent).toBe('blue');
    expect(await accent('Blue')).toBeChecked();
    expect(reset).toHaveFocus();
    expect(reset).toHaveAttribute('aria-disabled', 'true');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(saves).toEqual([]);
  });

  it('saves the current-job switch', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const job = await jobCheckbox();
    await waitFor(() => expect(job).toBeEnabled(), { timeout: 5000 });
    expect(job).toBeChecked();
    await userEvent.click(job);
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect(saves[0]).toMatchObject({
      record: { badge: { showRole: false } },
    });
    expect(saves[0]!.record).not.toHaveProperty('showJob');
  });

  it('asks for permission instead of letting an identity-only session edit', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did, 'atproto'));
    servePerson();
    renderRoute('/lanyard');
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Lanyards needs your permission' },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
    await preview();
    expect(await accent('Mint')).toBeDisabled();
    expect(await jobCheckbox()).toBeDisabled();
  });

  it('never saves over settings it could not read', async () => {
    servePerson();
    server.use(
      http.get(`${ADA.pds}/xrpc/com.atproto.repo.getRecord`, ({ request }) =>
        new URL(request.url).searchParams.get('collection') ===
        'app.lanyards.actor.lanyard'
          ? HttpResponse.json({}, { status: 500 })
          : undefined
      )
    );
    renderRoute('/lanyard');
    await preview();
    expect(
      await screen.findByText(
        "Couldn't load your lanyard settings",
        undefined,
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
    expect(await accent('Mint')).toBeDisabled();
  });

  it('saves a new block order', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const links = await screen.findByRole(
      'listitem',
      { name: 'Links' },
      { timeout: 5000 }
    );
    const down = within(links).getByRole('button', { name: 'Move Links down' });
    await waitFor(() => expect(down).toBeEnabled(), { timeout: 5000 });
    await userEvent.click(down);
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    const record = saves[0]?.record as { blocks: { type: string }[] };
    expect(record.blocks.slice(0, 2).map((block) => block.type)).toEqual([
      'talks',
      'links',
    ]);
  });

  it('hides a record in place, then shows it again', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const region = await preview();
    const hide = await within(region).findByRole(
      'button',
      { name: 'Hide Building on ATProto at Example Conf 2024' },
      { timeout: 8000 }
    );
    await userEvent.click(hide);
    // Still there, marked Hidden, with focus on its toggle.
    expect(within(region).getByText(/Example Conf 2024/)).toBeInTheDocument();
    const show = within(region).getByRole('button', {
      name: 'Show Building on ATProto at Example Conf 2024',
    });
    expect(show).toHaveFocus();
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect((saves[0]?.record as { hidden: string[] }).hidden).toHaveLength(1);

    await userEvent.click(show);
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(2), { timeout: 3000 });
    expect((saves[1]?.record as { hidden: string[] }).hidden).toEqual([]);
  });

  it('refuses to hide a 501st item, saying why', async () => {
    const failed = vi.spyOn(notify, 'error');
    servePerson({
      config: {
        hidden: Array.from({ length: 500 }, (_, index) => `k${index}`),
      },
    });
    const saves = captureSaves();
    renderRoute('/lanyard');
    const region = await preview();
    await userEvent.click(
      await within(region).findByRole(
        'button',
        { name: 'Hide Building on ATProto at Example Conf 2024' },
        { timeout: 8000 }
      )
    );
    await waitFor(() =>
      expect(failed).toHaveBeenCalledWith(
        'You can hide up to 500 items. Show some again first.'
      )
    );
    expect(within(region).getByText(/Example Conf 2024/)).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(saves).toEqual([]);
  });

  it('links can only be hidden', async () => {
    servePerson();
    renderRoute('/lanyard');
    const links = await linksBlock();
    expect(
      await within(links).findByRole(
        'button',
        { name: 'Hide GitHub' },
        { timeout: 8000 }
      )
    ).toBeInTheDocument();
    expect(
      within(links).queryByRole('button', { name: 'Add a link' })
    ).toBeNull();
    expect(
      within(links).queryByRole('button', { name: /^(Edit|Delete) / })
    ).toBeNull();
  });

  it('has no Title control: the title comes from Sifa', async () => {
    servePerson();
    renderRoute('/lanyard');
    await enabled('Hide GitHub');
    expect(screen.queryByRole('combobox', { name: 'Title' })).toBeNull();
  });

  it('a session with only the lanyard and media scopes can edit podcasts', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(
        ADA.did,
        [
          'atproto',
          'repo:app.lanyards.actor.lanyard?action=create&action=update',
          'repo:app.lanyards.media.item?action=create&action=update&action=delete',
          'repo:app.lanyards.link.media.audio?action=create&action=update&action=delete',
          'repo:app.lanyards.link.media.video?action=create&action=update&action=delete',
        ].join(' ')
      )
    );
    servePerson({ config: { blocks: [{ type: 'media', visible: true }] } });
    renderRoute('/lanyard');
    expect(await enabled('Add a podcast or video')).toBeEnabled();
    expect(
      screen.queryByRole('heading', { name: 'Lanyards needs your permission' })
    ).toBeNull();
  });

  it('holds editing while legacy podcasts move, and says so (#132)', async () => {
    servePerson({ config: { blocks: [{ type: 'media', visible: true }] } });
    mockListRecords(ADA.pds, ADA.did, 'app.lanyards.link.media.audio', [
      {
        uri: `at://${ADA.did}/app.lanyards.link.media.audio/3mlegacy`,
        cid: CID,
        value: {
          $type: 'app.lanyards.link.media.audio',
          url: 'https://pod.example/legacy',
          platform: 'spotify',
          title: 'Legacy episode',
          createdAt: '2025-01-01T09:00:00.000Z',
        },
      },
    ]);
    // The move never finishes.
    server.use(
      http.post(
        `${VIEWER_PDS}/xrpc/com.atproto.repo.applyWrites`,
        () => new Promise<never>(() => {})
      )
    );
    renderRoute('/lanyard');
    expect(
      await screen.findByText('Updating your podcasts and videos…', undefined, {
        timeout: 8000,
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Add a podcast or video' })
    ).toBeDisabled();
  });

  it('keeps the ORCID helper in Publications while editing', async () => {
    servePerson({
      config: {
        blocks: [
          { type: 'links', visible: true },
          { type: 'media', visible: true },
          { type: 'publications', visible: true, limit: 3 },
        ],
      },
    });
    renderRoute('/lanyard');
    const region = await preview();
    const publications = await within(region).findByRole(
      'listitem',
      { name: 'Publications' },
      { timeout: 8000 }
    );
    expect(
      await within(publications).findByRole(
        'heading',
        { level: 3, name: /ORCID iD/ },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
  });

  it('adds a podcast in a dialog; it’s saved only on Save', async () => {
    servePerson({ config: { blocks: [{ type: 'media', visible: true }] } });
    const batches = captureWrites();
    renderRoute('/lanyard');
    await userEvent.click(await enabled('Add a podcast or video'));
    const dialog = screen.getByRole('dialog', {
      name: 'Add a podcast or video',
    });
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Web address' }),
      'https://pod.example/new'
    );
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Platform' }),
      'spotify'
    );
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Title' }),
      'New episode'
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Add media' })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      within(await preview()).getByText('New episode')
    ).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(batches).toEqual([]);
    await saveChanges();
    await waitFor(() => expect(batches).toHaveLength(1), { timeout: 3000 });
    expect(batches[0]).toEqual([
      expect.objectContaining({
        $type: 'com.atproto.repo.applyWrites#create',
        collection: 'app.lanyards.media.item',
        value: expect.objectContaining({
          url: 'https://pod.example/new',
          platform: 'spotify',
          title: 'New episode',
        }),
      }),
    ]);
  });

  it('a new podcast hidden before Save stays hidden after it', async () => {
    servePerson({ config: { blocks: [{ type: 'media', visible: true }] } });
    const batches = captureWrites();
    const saves = captureSaves();
    renderRoute('/lanyard');
    await userEvent.click(await enabled('Add a podcast or video'));
    const dialog = screen.getByRole('dialog', {
      name: 'Add a podcast or video',
    });
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Web address' }),
      'https://pod.example/secret'
    );
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Platform' }),
      'spotify'
    );
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Title' }),
      'Secret episode'
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Add media' })
    );
    await userEvent.click(
      within(await preview()).getByRole('button', {
        name: 'Hide Secret episode',
      })
    );
    await saveChanges();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    const created = batches[0]?.[0];
    const hidden = (saves[0]?.record as { hidden: string[] }).hidden;
    // Hidden under the very key it was created at.
    expect(hidden).toEqual([
      `at://${ADA.did}/app.lanyards.media.item/${created?.rkey}`,
    ]);
  });

  it('explains a stored record it cannot read, and resets only when asked', async () => {
    servePerson({
      config: { blocks: [{ type: 'links', visible: true, limit: 0 }] },
    });
    const saves = captureSaves();
    renderRoute('/lanyard');
    expect(
      await screen.findByText(
        "We couldn't read your lanyard settings",
        undefined,
        {
          timeout: 5000,
        }
      )
    ).toBeInTheDocument();
    expect(await accent('Mint')).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Reset to defaults' })
    );
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect(saves[0]).toMatchObject({
      record: { accent: 'blue', createdAt: '2026-11-01T09:00:00.000Z' },
    });
    await waitFor(() => expect(accent('Mint')).resolves.toBeEnabled());
  });

  it('has no accessibility violations', async () => {
    servePerson();
    const { container } = renderRoute('/lanyard');
    const region = await preview();
    await within(region).findByRole(
      'heading',
      { level: 2, name: 'Dr Ada Example' },
      { timeout: 5000 }
    );
    await expectNoAxeViolations(container);
  });
});
