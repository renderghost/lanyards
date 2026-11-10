import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { ALICE, TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const PROFILE_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile';

beforeEach(() => {
  server.use(
    http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] })),
    http.get(PROFILE_URL, () => HttpResponse.json(ALICE))
  );
});

describe('/settings', () => {
  it('sends signed-out visitors to sign in first', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    const { router } = renderRoute('/settings');
    await waitFor(() =>
      expect(router.state.location.href).toBe('/?returnTo=%2Fsettings')
    );
  });

  it('shows the account to signed-in visitors', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/settings');
    expect(
      await screen.findByRole('heading', { name: 'Your account' })
    ).toBeInTheDocument();
    expect(await screen.findByText('@alice.bsky.social')).toBeInTheDocument();
    expect(document.title).toBe('Your account · Lanyards');
  });
});

describe('unknown pages', () => {
  it('say so and link home', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/no-such-page');
    expect(
      await screen.findByText("We couldn't find that page")
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to the home page' })
    ).toHaveAttribute('href', '/');
    expect(document.title).toBe('Page not found · Lanyards');
  });
});
