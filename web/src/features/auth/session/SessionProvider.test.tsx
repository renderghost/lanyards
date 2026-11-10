import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { restoreSession, signOut } from '@/lib/atproto/session';
import { renderWithProviders } from '@/test/render';

import { SessionProvider } from './SessionProvider';
import { useSession } from './useSession';

vi.mock('@/lib/atproto/session', () => ({
  restoreSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const session = { did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz' } as never;

function Probe() {
  const session = useSession();
  return (
    <>
      <p>status: {session.status}</p>
      <button type="button" onClick={() => void session.signOut()}>
        Sign out
      </button>
      <button type="button" onClick={() => void session.refresh()}>
        Refresh
      </button>
    </>
  );
}

const renderProvider = () =>
  renderWithProviders(
    <SessionProvider>
      <Probe />
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
