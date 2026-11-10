import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const signedIn = {
  status: 'signedIn',
  session: { did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz' },
  signOut: vi.fn(),
  refresh: vi.fn(),
} as never;

beforeEach(() => {
  server.use(http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] })));
});

describe('landing page', () => {
  it('shows the sign-in form to signed-out visitors', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    renderRoute('/');
    expect(
      await screen.findByRole('heading', {
        name: 'Your conference lanyard, from your AT Protocol account',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('sends a signed-in visitor to their account', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/settings')
    );
  });

  it('honours a safe return path for signed-in visitors', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/?returnTo=%2Fsettings%3Ftab%3Ddata');
    await waitFor(() =>
      expect(router.state.location.href).toBe('/settings?tab=data')
    );
  });

  it('ignores an unsafe return path', async () => {
    vi.mocked(useSession).mockReturnValue(signedIn);
    const { router } = renderRoute('/?returnTo=%2F%2Fevil.com');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/settings')
    );
  });
});
