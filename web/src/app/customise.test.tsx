import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';
import {
  KEPT_CREATED_AT,
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

const BLOG = {
  rkey: '3mblog',
  url: 'https://blog.ada.example/',
  title: 'Blog',
};

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
  document.documentElement.dataset.accent = 'violet';
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
    expect(
      await within(region).findByRole(
        'heading',
        { level: 2, name: 'Dr Ada Example' },
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

  it('frames the lanyard on its own ground inside the preview', async () => {
    servePerson();
    renderRoute('/lanyard');
    const region = await preview();
    const name = await within(region).findByRole(
      'heading',
      { level: 2, name: 'Dr Ada Example' },
      { timeout: 5000 }
    );
    // The lanyard brings its own ground; the customiser around it is neutral.
    const ground = name.closest<HTMLElement>('.bg-background');
    expect(ground).not.toBeNull();
    expect(ground).not.toBe(region);
    expect(region).toContainElement(ground);
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
    expect(screen.queryByRole('button', { name: 'Add a link' })).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Title' })).toBeNull();
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
    const teal = await accent('Teal');
    await waitFor(() => expect(teal).toBeEnabled(), { timeout: 5000 });
    await userEvent.click(teal);
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
    const teal = await accent('Teal');
    await waitFor(() => expect(teal).toBeEnabled(), { timeout: 5000 });
    await userEvent.click(teal);
    expect(document.documentElement.dataset.accent).toBe('teal');
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
      record: { $type: 'app.lanyards.actor.lanyard', accent: 'teal' },
    });
    await waitFor(() => expect(status).toHaveTextContent('All changes saved'));
  });

  it('resets unsaved changes to the last save, writing nothing', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const teal = await accent('Teal');
    await waitFor(() => expect(teal).toBeEnabled(), { timeout: 5000 });
    const save = screen.getByRole('button', { name: 'Save' });
    const reset = within(screen.getByRole('banner')).getByRole('button', {
      name: 'Reset',
    });
    expect(save).toHaveAttribute('aria-disabled', 'true');
    expect(reset).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(teal);
    expect(save).not.toHaveAttribute('aria-disabled');
    await userEvent.click(reset);
    expect(document.documentElement.dataset.accent).toBe('violet');
    expect(await accent('Violet')).toBeChecked();
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
    expect(saves[0]).toMatchObject({ record: { showJob: false } });
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
    expect(await accent('Teal')).toBeDisabled();
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
    expect(await accent('Teal')).toBeDisabled();
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

  it('adds a link in place; it’s saved only on Save', async () => {
    const success = vi.spyOn(notify, 'success');
    servePerson();
    const batches = captureWrites();
    renderRoute('/lanyard');
    await userEvent.click(await enabled('Add a link'));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Web address' }),
      'https://new.ada.example/'
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'New');
    await userEvent.click(screen.getByRole('button', { name: 'Add link' }));
    expect(within(await linksBlock()).getByText('New')).toBeInTheDocument();
    expect(
      within(screen.getByRole('banner')).getByRole('status')
    ).toHaveTextContent('Unsaved changes');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(batches).toEqual([]);
    await saveChanges();
    await waitFor(() => expect(batches).toHaveLength(1), { timeout: 3000 });
    expect(batches[0]).toEqual([
      expect.objectContaining({
        $type: 'com.atproto.repo.applyWrites#create',
        collection: 'app.lanyards.link.web',
        value: expect.objectContaining({
          url: 'https://new.ada.example/',
          title: 'New',
        }),
      }),
    ]);
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith('Lanyard updated')
    );
  });

  it('edits an own link’s title, keeping when it was created', async () => {
    servePerson({ webLinks: [BLOG] });
    const batches = captureWrites();
    renderRoute('/lanyard');
    await userEvent.click(await enabled('Edit Blog'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'Writing');
    await userEvent.click(screen.getByRole('button', { name: 'Update link' }));
    expect(within(await linksBlock()).getByText('Writing')).toBeInTheDocument();
    await saveChanges();
    await waitFor(() => expect(batches).toHaveLength(1), { timeout: 3000 });
    expect(batches[0]).toEqual([
      expect.objectContaining({
        $type: 'com.atproto.repo.applyWrites#update',
        collection: 'app.lanyards.link.web',
        rkey: BLOG.rkey,
        value: expect.objectContaining({
          url: BLOG.url,
          title: 'Writing',
          createdAt: KEPT_CREATED_AT,
        }),
      }),
    ]);
  });

  it('deletes an own link, and Reset brings it back', async () => {
    servePerson({ webLinks: [BLOG] });
    const batches = captureWrites();
    renderRoute('/lanyard');
    await userEvent.click(await enabled('Delete Blog'));
    const links = await linksBlock();
    expect(within(links).queryByText('Blog')).toBeNull();
    await userEvent.click(
      within(screen.getByRole('banner')).getByRole('button', { name: 'Reset' })
    );
    expect(within(links).getByText('Blog')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(batches).toEqual([]);
  });

  it('Sifa and Bluesky links can only be hidden', async () => {
    servePerson({ webLinks: [BLOG] });
    renderRoute('/lanyard');
    await enabled('Edit Blog');
    const links = await linksBlock();
    expect(
      within(links).getByRole('button', { name: 'Hide GitHub' })
    ).toBeInTheDocument();
    expect(
      within(links).queryByRole('button', { name: 'Edit GitHub' })
    ).toBeNull();
    expect(
      within(links).queryByRole('button', { name: 'Delete GitHub' })
    ).toBeNull();
  });

  it('sets the title on the badge, saving it with the rest', async () => {
    servePerson();
    const batches = captureWrites();
    renderRoute('/lanyard');
    const title = await screen.findByRole(
      'combobox',
      { name: 'Title' },
      { timeout: 8000 }
    );
    await waitFor(() => expect(title).toBeEnabled(), { timeout: 5000 });
    expect(title).toHaveValue('Dr');
    await userEvent.selectOptions(title, 'Prof');
    expect(
      within(await preview()).getByRole('heading', {
        level: 2,
        name: 'Prof Ada Example',
      })
    ).toBeInTheDocument();
    await saveChanges();
    await waitFor(() => expect(batches).toHaveLength(1), { timeout: 3000 });
    expect(batches[0]).toEqual([
      expect.objectContaining({
        $type: 'com.atproto.repo.applyWrites#update',
        collection: 'app.lanyards.actor.biography.honorific',
        rkey: 'self',
        value: expect.objectContaining({
          value: 'Prof',
          createdAt: KEPT_CREATED_AT,
        }),
      }),
    ]);
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
    expect(await accent('Teal')).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Reset to defaults' })
    );
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect(saves[0]).toMatchObject({
      record: { accent: 'violet', createdAt: '2026-11-01T09:00:00.000Z' },
    });
    await waitFor(() => expect(accent('Teal')).resolves.toBeEnabled());
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
