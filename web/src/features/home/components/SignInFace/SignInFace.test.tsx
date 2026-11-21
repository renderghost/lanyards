import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { startSignIn, startSignUp } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { SignInFace } from './SignInFace';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignIn: vi.fn(() => Promise.resolve()),
  startSignUp: vi.fn(() => Promise.resolve()),
}));

const signedOut = () =>
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });

const face = (returnTo = '/settings') =>
  renderInRouter(
    <div data-accent="lime">
      <SignInFace returnTo={returnTo} />
    </div>,
    '/sign-in'
  );

beforeEach(() => {
  signedOut();
});

describe('SignInFace, the homepage badge’s back (#157, #175)', () => {
  it('puts the sign-in form on the badge, with the typeahead', async () => {
    const { container } = face();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Your handle' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create an account' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('signs in, coming back to where the person was', async () => {
    face();
    await userEvent.type(
      await screen.findByRole('combobox', { name: 'Your handle' }),
      'alice.bsky.social'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(startSignIn).toHaveBeenCalledWith('alice.bsky.social', '/settings');
  });

  it('creates an account, coming back to where the person was', async () => {
    face();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create an account' })
    );
    expect(startSignUp).toHaveBeenCalledWith('/settings');
  });

  it('says it’s loading while the session loads', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'loading',
      signOut: vi.fn(),
      refresh: vi.fn(),
    });
    face();
    expect(await screen.findByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  // The badge clips nothing on its back: the suggestions hang below it.
  it('lets the handle’s suggestions hang out of the badge (#176)', async () => {
    face();
    const combobox = await screen.findByRole('combobox', {
      name: 'Your handle',
    });
    for (
      let element: HTMLElement | null = combobox.parentElement;
      element && !element.hasAttribute('data-accent');
      element = element.parentElement
    ) {
      expect(element.className).not.toMatch(/\boverflow-(hidden|clip)\b/);
    }
  });
});
