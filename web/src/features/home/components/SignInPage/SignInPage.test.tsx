import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { startSignIn, startSignUp } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { signedInSession } from '@/test/person';
import { renderInRouter } from '@/test/router';

import { SignInPage } from './SignInPage';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignIn: vi.fn(() => Promise.resolve()),
  startSignUp: vi.fn(() => Promise.resolve()),
}));

const signedOut = () =>
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });

const page = (returnTo = '/settings') =>
  renderInRouter(
    <SignInPage returnTo={returnTo} />,
    `/sign-in?returnTo=${encodeURIComponent(returnTo)}`
  );

beforeEach(() => {
  signedOut();
});

describe('SignInPage (#157)', () => {
  it('puts the sign-in form on a badge, with the typeahead', async () => {
    const { container } = page();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Your handle' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create an account' })
    ).toBeInTheDocument();
    expect(document.title).toBe('Sign in · Lanyards');
    await expectNoAxeViolations(container);
  });

  it('has the homepage’s header, without a Sign in link to itself', async () => {
    page();
    const banner = await screen.findByRole('banner');
    expect(
      within(banner).getByRole('link', { name: 'Lanyards' })
    ).toHaveAttribute('href', '/');
    expect(within(banner).queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(screen.getByRole('main')).not.toContainElement(banner);
  });

  it('signs in, coming back to where the person was', async () => {
    page();
    await userEvent.type(
      await screen.findByRole('combobox', { name: 'Your handle' }),
      'alice.bsky.social'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(startSignIn).toHaveBeenCalledWith('alice.bsky.social', '/settings');
  });

  it('creates an account, coming back to where the person was', async () => {
    page();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create an account' })
    );
    expect(startSignUp).toHaveBeenCalledWith('/settings');
  });

  it('says it’s loading while the session loads', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'loading',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    page();
    expect(await screen.findByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('sends someone already signed in on to where they were going', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    const { router } = page();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/settings')
    );
  });

  it('sends someone already signed in to their lanyard by default', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    const { router } = page('/');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/lanyard')
    );
  });
});
