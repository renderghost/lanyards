import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { captureError, track } from '@/lib/analytics/analytics';
import { restoreSession, signOut } from '@/lib/atproto/session';
import { renderWithProviders } from '@/test/render';

import { SessionProvider } from './SessionProvider';
import { useSession } from './useSession';

vi.mock('@/lib/atproto/session', () => ({
  restoreSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const session = { did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz' } as never;

function Probe({ leave }: { leave?: () => Promise<void> }) {
  const session = useSession();
  return (
    <>
      <p>status: {session.status}</p>
      <button type="button" onClick={() => void session.signOut()}>
        Sign out
      </button>
      <button type="button" onClick={() => void session.signOut(leave)}>
        Sign out and leave
      </button>
      <button type="button" onClick={() => void session.refresh()}>
        Refresh
      </button>
    </>
  );
}

const renderProvider = (leave?: () => Promise<void>) =>
  renderWithProviders(
    <SessionProvider>
      <Probe leave={leave} />
    </SessionProvider>
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('SessionProvider', () => {
  it('starts loading, then signs in from a restored session', async () => {
    vi.mocked(restoreSession).mockResolvedValue({
      status: 'restored',
      session,
    });
    renderProvider();
    expect(screen.getByText('status: loading')).toBeInTheDocument();
    expect(await screen.findByText('status: signedIn')).toBeInTheDocument();
  });

  it('tells the user when their session expired', async () => {
    vi.mocked(restoreSession).mockResolvedValue({ status: 'expired' });
    renderProvider();
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(notify.info).toHaveBeenCalledWith(
      "You've been signed out. Please sign in again."
    );
    expect(track).toHaveBeenCalledWith('session_expired');
  });

  it('settles signed out if restoring the session throws', async () => {
    const error = new DOMException('Storage is disabled', 'SecurityError');
    vi.mocked(restoreSession).mockRejectedValue(error);
    renderProvider();
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(error, {
      source: 'session-restore',
    });
  });

  it('stays quiet when nobody had signed in', async () => {
    vi.mocked(restoreSession).mockResolvedValue({ status: 'none' });
    renderProvider();
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(notify.info).not.toHaveBeenCalled();
  });

  it('signs out and confirms it', async () => {
    vi.mocked(restoreSession).mockResolvedValue({
      status: 'restored',
      session,
    });
    vi.mocked(signOut).mockResolvedValue(undefined);
    renderProvider();
    await screen.findByText('status: signedIn');
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(signOut).toHaveBeenCalledWith(session);
    expect(notify.success).toHaveBeenCalledWith('Signed out');
    expect(track).toHaveBeenCalledWith('signed_out');
  });

  it('moves on before anyone is shown as signed out (#172)', async () => {
    vi.mocked(restoreSession).mockResolvedValue({
      status: 'restored',
      session,
    });
    vi.mocked(signOut).mockResolvedValue(undefined);
    const seen: string[] = [];
    // Where to go next, once the session has ended. Meanwhile nobody is
    // signed in or out, so a page that needs a session doesn't send
    // people off to sign in again.
    const leave = vi.fn(async () => {
      await screen.findByText('status: loading');
      seen.push(
        vi.mocked(signOut).mock.calls.length ? 'ended' : 'still signed in'
      );
    });
    renderProvider(leave);
    await screen.findByText('status: signedIn');
    await userEvent.click(
      screen.getByRole('button', { name: 'Sign out and leave' })
    );
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(leave).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['ended']);
    expect(notify.success).toHaveBeenCalledWith('Signed out');
  });

  it('signs out even if moving on fails', async () => {
    vi.mocked(restoreSession).mockResolvedValue({
      status: 'restored',
      session,
    });
    vi.mocked(signOut).mockResolvedValue(undefined);
    const failure = new Error('navigation failed');
    renderProvider(() => Promise.reject(failure));
    await screen.findByText('status: signedIn');
    await userEvent.click(
      screen.getByRole('button', { name: 'Sign out and leave' })
    );
    expect(await screen.findByText('status: signedOut')).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(failure, {
      source: 'sign-out-leave',
    });
  });

  it('refresh() picks up a session stored after sign-in', async () => {
    vi.mocked(restoreSession).mockResolvedValueOnce({ status: 'none' });
    renderProvider();
    await screen.findByText('status: signedOut');
    vi.mocked(restoreSession).mockResolvedValueOnce({
      status: 'restored',
      session,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() =>
      expect(screen.getByText('status: signedIn')).toBeInTheDocument()
    );
  });
});
