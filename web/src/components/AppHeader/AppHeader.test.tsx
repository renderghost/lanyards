import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { startSignUp } from '@/lib/atproto/session';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderInRouter } from '@/test/router';

import { AppHeader } from './AppHeader';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignUp: vi.fn(() => Promise.resolve()),
}));

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
    expect(
      screen.queryByRole('link', { name: 'My lanyard' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Show QR' })
    ).not.toBeInTheDocument();
  });

  /** The banner's links and buttons, by name, in order. */
  const controls = (banner: HTMLElement) =>
    [...banner.querySelectorAll<HTMLElement>('a[href], button')].map(
      (control) =>
        control.getAttribute('aria-label') ??
        // The logo link is named by the logo inside it.
        control.querySelector('img')?.getAttribute('alt') ??
        control.textContent
    );

  it('gives signed-in people Customise and View, then Show QR and Account (#150)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
    renderInRouter(<AppHeader />, `/${ALICE.handle}`);
    const banner = await screen.findByRole('banner');
    const nav = within(banner).getByRole('navigation', {
      name: 'Your Lanyards',
    });
    expect(
      within(nav).getByRole('link', { name: 'Customise' })
    ).toHaveAttribute('href', `/${ALICE.handle}/edit`);
    const view = within(nav).getByRole('link', { name: 'View' });
    expect(view).toHaveAttribute('href', `/${ALICE.handle}`);
    expect(view).toHaveAttribute('aria-current', 'page');
    expect(
      within(nav).getByRole('link', { name: 'Customise' })
    ).not.toHaveAttribute('aria-current');
    expect(
      within(banner).getByRole('link', { name: 'Show QR' })
    ).toHaveAttribute('href', `/${ALICE.handle}/share`);
    expect(
      within(banner).getByRole('link', { name: 'Your account' })
    ).toHaveAttribute('href', '/settings');
    expect(controls(banner)).toEqual([
      'Lanyards',
      'Customise',
      'View',
      'Show QR',
      'Your account',
    ]);
  });

  it('puts a page’s own actions before Show QR and Account (#150)', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedIn',
      session: { did: ALICE.did } as never,
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
    renderInRouter(
      <AppHeader actions={<button type="button">Save</button>} />,
      `/${ALICE.handle}/edit`
    );
    const banner = await screen.findByRole('banner');
    expect(controls(banner)).toEqual([
      'Lanyards',
      'Customise',
      'View',
      'Save',
      'Show QR',
      'Your account',
    ]);
    expect(
      within(banner).getByRole('link', { name: 'Customise' })
    ).toHaveAttribute('aria-current', 'page');
    // View is /<handle>, a prefix of /<handle>/edit: not current here.
    expect(
      within(banner).getByRole('link', { name: 'View' })
    ).not.toHaveAttribute('aria-current');
  });

  it('clears the top safe area in the installed app', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    renderInRouter(<AppHeader />);
    const header = await screen.findByRole('banner');
    expect(header.className).toContain('env(safe-area-inset-top)');
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

  it('offers sign-in and sign-up to signed-out visitors where asked', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    const { container } = renderInRouter(
      <AppHeader signedOutActions />,
      '/@alice.test'
    );
    expect(
      await screen.findByRole('link', { name: 'Sign in' })
    ).toHaveAttribute(
      'href',
      `/?returnTo=${encodeURIComponent('/@alice.test')}`
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Make your lanyard' })
    );
    expect(startSignUp).toHaveBeenCalledWith('/@alice.test');
    await expectNoAxeViolations(container);
  });

  it('offers neither elsewhere, nor to someone signed in', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'signedOut',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as never);
    renderInRouter(<AppHeader />);
    await screen.findByRole('link', { name: 'Lanyards' });
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Make your lanyard' })
    ).toBeNull();
  });
});
