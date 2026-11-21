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
import { ADA } from '@/test/people';
import { servePerson, signedInSession } from '@/test/person';
import { renderRoute, waitForRoute } from '@/test/router';

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

describe('OAuth callback, trying again', () => {
  it('returns to the page the person started signing in from', async () => {
    sessionStorage.setItem('lanyards:returnTo', '/@alice.test');
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    renderRoute('/oauth/callback#error=access_denied');
    await screen.findByText('Sign-in was cancelled.');
    expect(tryAgain()).toHaveAttribute(
      'href',
      '/sign-in?returnTo=%2F%40alice.test'
    );
    sessionStorage.clear();
  });

  it('ignores an unsafe remembered path', async () => {
    sessionStorage.setItem('lanyards:returnTo', '//evil.example');
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    renderRoute('/oauth/callback#error=access_denied');
    await screen.findByText('Sign-in was cancelled.');
    expect(tryAgain()).toHaveAttribute('href', '/sign-in');
    sessionStorage.clear();
  });
});

describe('OAuth callback', () => {
  it('explains a cancelled sign-in and scrubs the URL', async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new OAuthCallbackError('denied')
    );
    const { router } = renderRoute('/oauth/callback#error=access_denied');
    expect(
      await screen.findByText('Sign-in was cancelled.')
    ).toBeInTheDocument();
    expect(tryAgain()).toHaveAttribute('href', '/sign-in');
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
    const { router } = renderRoute('/oauth/callback#error=access_denied');
    await userEvent.click(
      await screen.findByRole('link', { name: 'Try again' })
    );
    // Trying again goes to the sign-in page (#157), whose heading is also
    // "Sign in": wait for it to replace the callback page's.
    await waitForRoute(router, '/sign-in');
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Sign in',
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
    expect(tryAgain()).toHaveAttribute('href', '/sign-in');
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
    await waitForRoute(router, '/somewhere-else');
    expect(refresh).toHaveBeenCalled();
  });

  // A plain sign-in (no page to go back to) lands on your own customiser
  // (#167): /lanyard forwards to /<handle>/edit.
  it('lands on your own /<handle>/edit after a plain sign-in', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    servePerson();
    vi.mocked(completeSignIn).mockResolvedValue({
      did: ADA.did as never,
      returnTo: '/lanyard',
    });
    const { router } = renderRoute('/oauth/callback#code=a&state=b');
    await waitForRoute(router, `/${ADA.handle}/edit`, 5000);
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
