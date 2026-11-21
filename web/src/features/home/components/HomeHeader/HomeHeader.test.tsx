import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { HomeHeader } from './HomeHeader';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const signedOut = () =>
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });

/** The header on the homepage's blue. */
const header = (props: { signIn?: boolean } = {}) =>
  renderInRouter(
    <div data-accent="blue">
      <HomeHeader {...props} />
    </div>,
    '/'
  );

beforeEach(() => {
  signedOut();
});

describe('HomeHeader (#151)', () => {
  it('puts the logo and Sign in on the blue (#157)', async () => {
    const { container } = header();
    const banner = await screen.findByRole('banner');
    const home = within(banner).getByRole('link', { name: 'Lanyards' });
    expect(home).toHaveAttribute('href', '/');
    // The lime logo, which reads on brand blue in light and dark.
    expect(within(home).getByRole('img')).toHaveAttribute(
      'src',
      '/logo-dark.svg'
    );
    // Sign in has its own page; account creation is there too.
    const signIn = within(banner).getByRole('link', { name: 'Sign in' });
    expect(signIn).toHaveAttribute('href', '/sign-in');
    // A primary button: the badge's main button, white on the blue (#162).
    expect(signIn.className).toContain('bg-badge-button');
    expect(within(banner).queryByRole('button')).toBeNull();
    // No bar: it sits over the badge's ground.
    expect(banner.className).not.toMatch(/\bbg-|\bborder-b\b/);
    expect(banner.className).toContain('env(safe-area-inset-top)');
    await expectNoAxeViolations(container);
  });

  it('offers only the logo while the session loads', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'loading',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    header();
    const banner = await screen.findByRole('banner');
    expect(
      within(banner).getByRole('link', { name: 'Lanyards' })
    ).toBeInTheDocument();
    expect(within(banner).queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('leaves Sign in off the sign-in page itself', async () => {
    header({ signIn: false });
    const banner = await screen.findByRole('banner');
    expect(
      within(banner).getByRole('link', { name: 'Lanyards' })
    ).toBeInTheDocument();
    expect(within(banner).queryByRole('link', { name: 'Sign in' })).toBeNull();
  });
});
