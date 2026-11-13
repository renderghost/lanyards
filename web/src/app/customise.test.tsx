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
    const toggle = screen.getByRole('button', { name: 'View as visitor' });
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
    const status = screen.getByText('Saving…');
    expect(status.closest('[aria-live="polite"]')).not.toBeNull();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect(saves[0]).toMatchObject({
      repo: ADA.did,
      collection: 'app.lanyards.actor.lanyard',
      rkey: 'self',
      record: { $type: 'app.lanyards.actor.lanyard', accent: 'teal' },
    });
    expect(await screen.findByText('Saved')).toBeInTheDocument();
  });

  it('saves the current-job switch', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const job = await screen.findByRole('checkbox', {
      name: 'Show current job on your badge',
    });
    await waitFor(() => expect(job).toBeEnabled(), { timeout: 5000 });
    expect(job).toBeChecked();
    await userEvent.click(job);
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
    expect(
      screen.getByRole('checkbox', { name: 'Show current job on your badge' })
    ).toBeDisabled();
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
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    const record = saves[0]?.record as { blocks: { type: string }[] };
    expect(record.blocks.slice(0, 2).map((block) => block.type)).toEqual([
      'talks',
      'links',
    ]);
  });

  it('hides an item from the preview, then shows it again', async () => {
    servePerson();
    const saves = captureSaves();
    renderRoute('/lanyard');
    const region = await preview();
    await userEvent.click(
      await within(region).findByRole(
        'button',
        { name: 'More options for Building on ATProto at Example Conf 2024' },
        { timeout: 8000 }
      )
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Hide this item' })
    );
    expect(within(region).queryByText(/Example Conf 2024/)).toBeNull();
    await waitFor(() => expect(saves).toHaveLength(1), { timeout: 3000 });
    expect((saves[0]?.record as { hidden: string[] }).hidden).toHaveLength(1);

    const hidden = screen.getByRole('region', { name: 'Hidden items' });
    const showAgain = within(hidden).getByRole('button', {
      name: 'Show again',
      description: 'Building on ATProto at Example Conf 2024',
    });
    await waitFor(() => expect(showAgain).toHaveFocus());
    await userEvent.click(showAgain);
    expect(
      await within(region).findByText(/Example Conf 2024/)
    ).toBeInTheDocument();
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
        { name: 'More options for Building on ATProto at Example Conf 2024' },
        { timeout: 8000 }
      )
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Hide this item' })
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

  it('edits the kept records: honorific, links, podcasts and videos', async () => {
    servePerson();
    renderRoute('/lanyard');
    const honorific = await screen.findByRole(
      'group',
      { name: 'Honorific' },
      { timeout: 5000 }
    );
    await waitFor(
      () =>
        expect(
          within(honorific).getByRole('radio', { name: 'Dr' })
        ).toBeChecked(),
      { timeout: 5000 }
    );
    expect(
      screen.getByRole('region', { name: 'Your links' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Your podcasts and videos' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add link' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add media' })).toBeEnabled();
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
