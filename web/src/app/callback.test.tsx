import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { captureError } from '@/lib/analytics/analytics';
import { completeSignIn, OAuthCallbackError } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderRoute } from '@/test/router';

vi.mock('@/lib/atproto/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/atproto/session')>();
  return { ...actual, completeSignIn: vi.fn() };
});
vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

const refresh = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  server.use(http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] })));
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh,
  });
});

const tryAgain = () => screen.getByRole('link', { name: 'Try again' });

describe('OAuth callback', () => {
  it('explains a cancelled sign-in and scrubs the URL', async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    const { router } = renderRoute('/oauth/callback#error=access_denied');
    expect(
      await screen.findByText('Sign-in was cancelled.')
    ).toBeInTheDocument();
    expect(tryAgain()).toHaveAttribute('href', '/');
    expect(completeSignIn).toHaveBeenCalledTimes(1);
    expect(completeSignIn).toHaveBeenCalledWith('#error=access_denied');
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/oauth/callback');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign in' })
    ).toBeInTheDocument();
    expect(document.title).toBe('Signing in · Lanyards');
  });

  it('moves focus to the new page heading after navigating', async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    renderRoute('/oauth/callback#error=access_denied');
    await userEvent.click(
      await screen.findByRole('link', { name: 'Try again' })
    );
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Your conference lanyard, from your AT Protocol account',
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('explains an expired or reused link', async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('missing')
    );
    renderRoute('/oauth/callback');
    expect(
      await screen.findByText(
        'This sign-in link has expired or was already used.'
      )
    ).toBeInTheDocument();
    expect(tryAgain()).toHaveAttribute('href', '/');
  });

  it('explains a failed exchange and reports it', async () => {
    const error = new OAuthCallbackError('failed', { cause: new Error('x') });
    vi.mocked(completeSignIn).mockRejectedValue(error);
    const { router } = renderRoute('/oauth/callback#code=a&state=b');
    expect(
      await screen.findByText("We couldn't finish signing you in.")
    ).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(error, {
      source: 'oauth-callback',
    });
    expect(router.state.location.hash).toBe('');
  });

  it('shows progress, then continues to the requested page', async () => {
    let finish: (value: { did: never; returnTo: string }) => void = () => {};
    vi.mocked(completeSignIn).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { router } = renderRoute('/oauth/callback#code=a&state=b');
    expect(await screen.findByText('Signing you in…')).toBeInTheDocument();
    // A path with no redirect of its own (the mocked session stays signed
    // out, so /settings would bounce back to sign-in).
    finish({ did: 'did:plc:x' as never, returnTo: '/somewhere-else' });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/somewhere-else')
    );
    expect(refresh).toHaveBeenCalled();
  });

  it('has no axe violations when showing an error', async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    const { container } = renderRoute('/oauth/callback#error=access_denied');
    await screen.findByText('Sign-in was cancelled.');
    await expectNoAxeViolations(container);
  });
});
