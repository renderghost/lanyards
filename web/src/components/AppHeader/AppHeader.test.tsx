import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderInRouter } from '@/test/router';

import { AppHeader } from './AppHeader';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

describe('AppHeader', () => {
  it('links the logo home and shows no account link when signed out', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    renderInRouter(<AppHeader />);
    expect(
      await screen.findByRole('link', { name: 'Lanyards' })
    ).toHaveAttribute('href', '/');
    expect(
      screen.queryByRole('link', { name: 'Your account' })
    ).not.toBeInTheDocument();
  });

  it('links to the account when signed in', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
    renderInRouter(<AppHeader />);
    expect(
      await screen.findByRole('link', { name: 'Your account' })
    ).toHaveAttribute('href', '/settings');
  });

  it('has no axe violations', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
    const { container } = renderInRouter(<AppHeader />);
    await screen.findByRole('link', { name: 'Your account' });
    await expectNoAxeViolations(container);
  });
});
