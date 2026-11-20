import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { startSignUp } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { HomeHeader } from './HomeHeader';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignUp: vi.fn(() => Promise.resolve()),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const signedOut = () =>
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });

/** The header on the homepage's blue, with the form it signs in at. */
const header = () =>
  renderInRouter(
    <div data-accent="blue">
      <HomeHeader />
      <input id="sign-in-handle" aria-label="Your handle" />
    </div>,
    '/'
  );

beforeEach(() => {
  signedOut();
});

describe('HomeHeader (#151)', () => {
  it('puts the logo, Sign in and Make your lanyard on the blue', async () => {
    const { container } = header();
    const banner = await screen.findByRole('banner');
    const home = within(banner).getByRole('link', { name: 'Lanyards' });
    expect(home).toHaveAttribute('href', '/');
    // The lime logo, which reads on brand blue in light and dark.
    expect(within(home).getByRole('img')).toHaveAttribute(
      'src',
      '/logo-dark.svg'
    );
    expect(
      within(banner).getByRole('link', { name: 'Sign in' })
    ).toHaveAttribute('href', '/#sign-in-handle');
    expect(
      within(banner).getByRole('button', { name: 'Make your lanyard' })
    ).toBeInTheDocument();
    // No bar: it sits over the badge's ground.
    expect(banner.className).not.toMatch(/\bbg-|\bborder-b\b/);
    expect(banner.className).toContain('env(safe-area-inset-top)');
    await expectNoAxeViolations(container);
  });

  it('takes Sign in to the form on the page, ready to type (#148)', async () => {
    const { router } = header();
    await userEvent.click(await screen.findByRole('link', { name: 'Sign in' }));
    expect(screen.getByRole('textbox', { name: 'Your handle' })).toHaveFocus();
    expect(router.state.location.href).toBe('/');
  });

  it('starts account creation, coming back to the homepage', async () => {
    header();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Make your lanyard' })
    );
    expect(startSignUp).toHaveBeenCalledWith('/');
  });

  it('says so if account creation can’t start', async () => {
    vi.mocked(startSignUp).mockRejectedValueOnce(new Error('offline'));
    header();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Make your lanyard' })
    );
    await vi.waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        "Couldn't start account creation. Please try again."
      )
    );
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
    expect(
      within(banner).queryByRole('button', { name: 'Make your lanyard' })
    ).toBeNull();
  });
});
