import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderInRouter } from '@/test/router';

import { AccountLink } from './AccountLink';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

describe('AccountLink', () => {
  it('links the signed-in person to their account, with their avatar', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
    const { container } = renderInRouter(<AccountLink />);
    expect(
      await screen.findByRole('link', { name: 'Your account' })
    ).toHaveAttribute('href', '/settings');
    await expectNoAxeViolations(container);
  });

  it('shows nothing when signed out', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    renderInRouter(
      <>
        <p>Page</p>
        <AccountLink />
      </>
    );
    await screen.findByText('Page');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
