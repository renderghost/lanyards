import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

import { AccountCard } from './AccountCard';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

const signOut = vi.fn();

const signedInAs = (profile: object | undefined, status = 'success') => {
  vi.mocked(useSession).mockReturnValue({
    status: 'signedIn',
    session: { did: ALICE.did } as never,
    signOut,
    refresh: vi.fn(),
  });
  vi.mocked(useProfile).mockReturnValue({
    data: profile,
    status,
    isPending: status === 'pending',
    isError: status === 'error',
  } as never);
};

describe('AccountCard', () => {
  it('shows who is signed in', () => {
    signedInAs(ALICE);
    renderWithProviders(<AccountCard />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('@alice.bsky.social')).toBeInTheDocument();
  });

  it('falls back to the handle when there is no display name', () => {
    signedInAs({ did: ALICE.did, handle: ALICE.handle });
    renderWithProviders(<AccountCard />);
    expect(screen.getByText('alice.bsky.social')).toBeInTheDocument();
  });

  it('signs out', async () => {
    signedInAs(ALICE);
    renderWithProviders(<AccountCard />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalled();
  });

  it('still offers sign-out when the profile cannot load', async () => {
    signedInAs(undefined, 'error');
    renderWithProviders(<AccountCard />);
    expect(
      screen.getByText("We couldn't load your profile.")
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    signedInAs(ALICE);
    const { container } = renderWithProviders(<AccountCard />);
    await expectNoAxeViolations(container);
  });
});
