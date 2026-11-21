import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderInRouter } from '@/test/router';

import { MobileNav } from './MobileNav';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

const signIn = () => {
  vi.mocked(useSession).mockReturnValue({
    status: 'signedIn',
    session: { did: ALICE.did } as never,
    signOut: vi.fn(),
    refresh: vi.fn(),
  });
  vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
};

describe('MobileNav (#150)', () => {
  it('offers Customise, View, Share and Account, in that order', async () => {
    signIn();
    const { container } = renderInRouter(
      <MobileNav />,
      `/${ALICE.handle}/edit`
    );
    const nav = await screen.findByRole('navigation', {
      name: 'Your Lanyards',
    });
    const links = within(nav).getAllByRole('link');
    expect(
      links.map((link) => [
        link.getAttribute('aria-label') ?? link.textContent,
        link.getAttribute('href'),
      ])
    ).toEqual([
      ['Customise', `/${ALICE.handle}/edit`],
      ['View', `/${ALICE.handle}`],
      ['Share', `/${ALICE.handle}/share`],
      ['Your account', '/settings'],
    ]);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    // View is /<handle>, a prefix of /<handle>/edit: not current here.
    for (const link of links.slice(1)) {
      expect(link).not.toHaveAttribute('aria-current');
    }
    // It keeps focus clear of itself when it covers the page's foot.
    expect(nav).toHaveAttribute('data-bottom-toolbar');
    await expectNoAxeViolations(container);
  });

  it('is nothing when signed out', () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    renderInRouter(<MobileNav />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
