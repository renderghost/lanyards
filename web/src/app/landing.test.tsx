import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { TYPEAHEAD_URL } from '@/test/fixtures';
import { ADA } from '@/test/people';
import { servePerson, signedInSession } from '@/test/person';
import { server } from '@/test/msw';
import { renderRoute, waitForRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const signedIn = {
  status: 'signedIn',
  session: { did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz', scope: 'atproto' },
  signOut: vi.fn(),
  refresh: vi.fn(),
} as never;

beforeEach(() => {
  server.use(http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] })));
});

/** The redirect loads a lazy route, which compiles cold under a full run. */
const LAZY_ROUTE_TIMEOUT = 5000;

describe('landing page', () => {
  it('offers feedback only in the customiser, not here (#134)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    await screen.findByRole('heading', { name: 'Welcome to Lanyards' });
    expect(screen.queryByRole('button', { name: 'Send feedback' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull();
  });

  it('shows signed-out visitors the homepage, with no form on it (#157)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Lanyards' })
    ).toBeInTheDocument();
    // The form is on the badge's back, out of reach until it turns (#175).
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(
      screen.getByRole('combobox', { hidden: true }).closest('[inert]')
    ).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
    expect(document.title).toBe(
      'Researcher profiles on the AT Protocol · Lanyards'
    );
  });

  it('offers Sign in in the header, to its own page (#157)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    const banner = await screen.findByRole('banner');
    expect(
      await within(banner).findByRole('link', { name: 'Sign in' })
    ).toHaveAttribute('href', '/sign-in');
    expect(
      within(banner).queryByRole('button', { name: 'Make your lanyard' })
    ).toBeNull();
  });

  it('signs in on /sign-in, with the typeahead (#157)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/sign-in?returnTo=%2Fsettings');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Your handle' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(document.title).toBe('Sign in · Lanyards');
  });

  it('turns the homepage badge over to sign in, and back (#175)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    const { router } = renderRoute('/');
    const welcome = await screen.findByRole('heading', {
      name: 'Welcome to Lanyards',
    });
    // One badge, two faces: the sign-in face is behind, out of reach.
    const signIn = () =>
      screen.getByRole('heading', { level: 1, name: 'Sign in', hidden: true });
    expect(welcome.closest('[inert]')).toBeNull();
    expect(signIn().closest('[inert]')).not.toBeNull();

    const banner = screen.getByRole('banner');
    await userEvent.click(
      await within(banner).findByRole('link', { name: 'Sign in' })
    );
    await waitForRoute(router, '/sign-in');
    // The same badge, turned over: nothing was rebuilt.
    await waitFor(() => expect(welcome.closest('[inert]')).not.toBeNull());
    expect(welcome).toBeInTheDocument();
    expect(signIn().closest('[inert]')).toBeNull();
    expect(signIn()).toHaveFocus();
    expect(document.title).toBe('Sign in · Lanyards');
    expect(within(banner).queryByRole('link', { name: 'Sign in' })).toBeNull();

    router.history.back();
    await waitForRoute(router, '/');
    await waitFor(() => expect(welcome.closest('[inert]')).toBeNull());
    expect(signIn().closest('[inert]')).not.toBeNull();
    expect(welcome).toHaveFocus();
    expect(document.title).toBe(
      'Researcher profiles on the AT Protocol · Lanyards'
    );
  });

  // Links from before the sign-in page had its own address (#157).
  it('sends /?returnTo= on to /sign-in, keeping where to return', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    const { router } = renderRoute('/?returnTo=%2Fsettings');
    await waitForRoute(router, '/sign-in?returnTo=%2Fsettings');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    ).toBeInTheDocument();
  });

  it('sends a signed-in visitor to their own customiser (#150)', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    servePerson();
    const { router } = renderRoute('/');
    await waitForRoute(router, `/${ADA.handle}/edit`, LAZY_ROUTE_TIMEOUT);
  });

  it('honours a safe return path for signed-in visitors', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/?returnTo=%2Fsettings%3Ftab%3Ddata');
    await waitForRoute(router, '/settings?tab=data', LAZY_ROUTE_TIMEOUT);
  });

  it('ignores an unsafe return path', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    servePerson();
    const { router } = renderRoute('/?returnTo=%2F%2Fevil.com');
    await waitForRoute(router, `/${ADA.handle}/edit`, LAZY_ROUTE_TIMEOUT);
  });
});
