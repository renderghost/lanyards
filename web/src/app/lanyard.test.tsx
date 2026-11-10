import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';
import {
  servePerson,
  serveViewerReads,
  signedInSession,
  signedOutSession,
} from '@/test/person';
import { renderRoute, waitForRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const hero = () =>
  screen.findByRole('heading', { level: 1, name: 'Dr Ada Example' });

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedOutSession());
  document.documentElement.dataset.accent = 'violet';
});

describe('public lanyard routes', () => {
  it('shows the badge for a handle', async () => {
    servePerson();
    renderRoute('/@alice.test');
    expect(await hero()).toBeInTheDocument();
    expect(screen.getByText('she/her')).toBeInTheDocument();
    expect(
      screen.getByText('Research Engineer building open research tools')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Research Engineer · Example Lab')
    ).toBeInTheDocument();
    expect(screen.getByText('@alice.test')).toBeInTheDocument();
    expect(
      document.querySelector('header + main img, main img')
    ).toHaveAttribute('alt', '');
    await waitFor(() => expect(document.title).toBe('Ada Example · Lanyards'));
  });

  it('shows the badge for a DID', async () => {
    servePerson();
    renderRoute(`/d/${ADA.did}`);
    expect(await hero()).toBeInTheDocument();
  });

  it.each([
    ['/@Alice.Test', '/@alice.test'],
    ['/%40alice.test', '/@alice.test'],
    [`/@${ADA.did}`, `/d/${ADA.did}`],
  ])('redirects %s to %s', async (from, to) => {
    servePerson();
    const { router } = renderRoute(from);
    await waitForRoute(router, to);
    expect(await hero()).toBeInTheDocument();
  });

  it('shows the not-found page for a malformed DID', async () => {
    renderRoute('/d/not-a-did');
    expect(
      await screen.findByRole('heading', { name: "We couldn't find that page" })
    ).toBeInTheDocument();
  });
});

describe('lanyard page states', () => {
  it('offers search when a handle does not exist', async () => {
    servePerson();
    const { container } = renderRoute('/@nobody.test');
    expect(
      await screen.findByRole('heading', {
        name: "We couldn't find @nobody.test",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Search for someone' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('says when an account is not available', async () => {
    servePerson({
      profileError: { error: 'AccountDeactivated', status: 400 },
    });
    renderRoute('/@alice.test');
    expect(
      await screen.findByRole('heading', {
        name: "This account isn't available",
      })
    ).toBeInTheDocument();
  });

  it('respects the opt-out from logged-out viewing', async () => {
    servePerson({
      profile: {
        labels: [
          {
            src: ADA.did,
            uri: `at://${ADA.did}/app.bsky.actor.profile/self`,
            val: '!no-unauthenticated',
            cts: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });
    const { container } = renderRoute('/@alice.test');
    expect(
      await screen.findByText(
        'This person has chosen to show their lanyard only to people who are signed in.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/?returnTo=%2F%40alice.test'
    );
    expect(screen.queryByText('Dr Ada Example')).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows an opted-out lanyard to signed-in people', async () => {
    servePerson({
      profile: {
        labels: [
          {
            src: ADA.did,
            uri: `at://${ADA.did}/app.bsky.actor.profile/self`,
            val: '!no-unauthenticated',
            cts: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });
    serveViewerReads();
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
    renderRoute('/@alice.test');
    expect(await hero()).toBeInTheDocument();
  });

  it('shows only a minimal page when either person blocks the other', async () => {
    servePerson();
    serveViewerReads({
      relationship: { blockedBy: `at://${ADA.did}/app.bsky.graph.block/3m` },
    });
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
    renderRoute('/@alice.test');
    expect(
      await screen.findByText("This lanyard isn't available to you.")
    ).toBeInTheDocument();
    expect(screen.queryByText('Dr Ada Example')).not.toBeInTheDocument();
  });

  it('passes axe on a loaded lanyard', async () => {
    servePerson();
    const { container } = renderRoute('/@alice.test');
    await hero();
    await expectNoAxeViolations(container);
  });
});

describe('shared context', () => {
  it('shows mutual follows and known followers to signed-in visitors', async () => {
    servePerson();
    serveViewerReads();
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
    renderRoute('/@alice.test');
    expect(
      await screen.findByText('You follow each other')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Followed by Bea Example, Cal Example and 3+ others you follow'
      )
    ).toBeInTheDocument();
  });

  it('is absent for signed-out visitors and on your own lanyard', async () => {
    servePerson();
    renderRoute('/@alice.test');
    await hero();
    expect(screen.queryByText('You follow each other')).not.toBeInTheDocument();
  });
});

describe('accent', () => {
  it('applies the owner’s accent while their lanyard is open', async () => {
    servePerson({ config: { accent: 'teal' } });
    renderRoute('/@alice.test');
    await hero();
    await waitFor(() =>
      expect(document.documentElement.dataset.accent).toBe('teal')
    );
  });
});

describe('lanyard blocks', () => {
  it('shows the default blocks: links and talks', async () => {
    servePerson();
    renderRoute('/@alice.test');
    const links = await screen.findByRole('region', { name: 'Links' });
    expect(
      within(links).getByRole('link', { name: 'GitHub (opens in a new tab)' })
    ).toBeInTheDocument();
    const talks = await screen.findByRole('region', { name: 'Talks' });
    expect(within(talks).getAllByText('Building on ATProto')).toHaveLength(2);
    expect(
      screen.queryByRole('region', { name: 'Skills' })
    ).not.toBeInTheDocument();
  });

  it('shows blocks the owner turned on, in their order', async () => {
    servePerson({
      config: {
        blocks: [
          { type: 'skills', visible: true },
          { type: 'links', visible: true },
          { type: 'talks', visible: false },
        ],
      },
    });
    renderRoute('/@alice.test');
    await screen.findByRole('region', { name: 'Skills' });
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(['Skills', 'Links']);
  });

  it('tells the owner when Sifa could not be loaded, and retries', async () => {
    servePerson();
    server.use(
      http.get('https://sifa.id/xrpc/id.sifa.getProfileView', () =>
        HttpResponse.json({}, { status: 500 })
      ),
      http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, ({ request }) =>
        new URL(request.url).searchParams
          .get('collection')
          ?.startsWith('id.sifa')
          ? HttpResponse.json({}, { status: 500 })
          : undefined
      )
    );
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    renderRoute('/@alice.test');
    const talks = await screen.findByRole(
      'region',
      { name: 'Talks' },
      { timeout: 5000 }
    );
    expect(
      await within(talks).findByText("Couldn't load Sifa", undefined, {
        timeout: 5000,
      })
    ).toBeInTheDocument();
    expect(
      within(talks).getByRole('button', { name: 'Retry' })
    ).toBeInTheDocument();
  });
});
