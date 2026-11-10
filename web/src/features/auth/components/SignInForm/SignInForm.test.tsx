import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { track } from '@/lib/analytics/analytics';
import { startSignIn, startSignUp } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderWithProviders } from '@/test/render';

import { SignInForm } from './SignInForm';

vi.mock('@/lib/atproto/session', () => ({
  startSignIn: vi.fn(),
  startSignUp: vi.fn(),
}));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: vi.fn() }));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

const input = () => screen.getByRole('combobox', { name: 'Your handle' });
const submit = () => screen.getByRole('button', { name: 'Sign in' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useOnlineStatus).mockReturnValue(true);
  server.use(http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] })));
});

describe('SignInForm', () => {
  it('asks for a handle when submitted empty and focuses the field', async () => {
    renderWithProviders(<SignInForm returnTo="/settings" />);
    await userEvent.click(submit());
    expect(screen.getByText('Enter your handle')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveFocus();
    expect(startSignIn).not.toHaveBeenCalled();
  });

  it('explains an email address on blur', async () => {
    renderWithProviders(<SignInForm returnTo="/" />);
    await userEvent.type(input(), 'me@x.com');
    await userEvent.tab();
    expect(
      screen.getByText(
        'Enter your handle, not your email — for example alice.bsky.social'
      )
    ).toBeInTheDocument();
  });

  it('starts sign-in with the normalised handle and shows it is busy', async () => {
    vi.mocked(startSignIn).mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<SignInForm returnTo="/settings" />);
    await userEvent.type(input(), '@Alice.Bsky.Social');
    await userEvent.click(submit());
    expect(startSignIn).toHaveBeenCalledWith('alice.bsky.social', '/settings');
    await waitFor(() => expect(submit()).toBeDisabled());
    expect(submit()).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps the handle and explains when sign-in cannot start', async () => {
    vi.mocked(startSignIn).mockRejectedValue(new Error('PDS unreachable'));
    renderWithProviders(<SignInForm returnTo="/" />);
    await userEvent.type(input(), 'alice.bsky.social');
    await userEvent.click(submit());
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        "Couldn't start sign-in. Please try again."
      )
    );
    expect(track).toHaveBeenCalledWith('sign_in_failed', { reason: 'start' });
    expect(input()).toHaveValue('alice.bsky.social');
    expect(submit()).toBeEnabled();
  });

  it('cannot be submitted while offline and says why', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    renderWithProviders(<SignInForm returnTo="/" />);
    expect(submit()).toBeDisabled();
    expect(
      screen.getByText("You're offline. Connect to sign in.")
    ).toBeInTheDocument();
  });

  it('offers account creation', async () => {
    vi.mocked(startSignUp).mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<SignInForm returnTo="/settings" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Create an account' })
    );
    expect(startSignUp).toHaveBeenCalledWith('/settings');
  });

  it('has no axe violations, including with an error shown', async () => {
    const { container } = renderWithProviders(<SignInForm returnTo="/" />);
    await expectNoAxeViolations(container);
    await userEvent.click(submit());
    await expectNoAxeViolations(container);
  });
});
