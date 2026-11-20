import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { TYPEAHEAD_URL } from '@/test/fixtures';
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
    await screen.findByRole('button', { name: 'Sign in' });
    expect(screen.queryByRole('button', { name: 'Send feedback' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull();
  });

  it('shows the sign-in form to signed-out visitors', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Lanyards' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(document.title).toBe(
      'Researcher profiles on the AT Protocol · Lanyards'
    );
  });

  it('offers Sign in and Make your lanyard in the header (#148)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    const banner = await screen.findByRole('banner');
    expect(
      await within(banner).findByRole('link', { name: 'Sign in' })
    ).toBeInTheDocument();
    expect(
      within(banner).getByRole('button', { name: 'Make your lanyard' })
    ).toBeInTheDocument();
  });

  it('is titled for signing in when sent here to sign in (#145)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/?returnTo=%2Fsettings');
    await screen.findByRole('heading', { name: 'Welcome to Lanyards' });
    expect(document.title).toBe('Sign in · Lanyards');
  });

  it('sends a signed-in visitor to their lanyard', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/');
    await waitForRoute(router, '/lanyard', LAZY_ROUTE_TIMEOUT);
  });

  it('honours a safe return path for signed-in visitors', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/?returnTo=%2Fsettings%3Ftab%3Ddata');
    await waitForRoute(router, '/settings?tab=data', LAZY_ROUTE_TIMEOUT);
  });

  it('ignores an unsafe return path', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/?returnTo=%2F%2Fevil.com');
    await waitForRoute(router, '/lanyard', LAZY_ROUTE_TIMEOUT);
  });
});
