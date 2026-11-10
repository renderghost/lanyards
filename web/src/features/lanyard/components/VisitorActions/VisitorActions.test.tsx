import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { startSignIn, startSignUp } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';
import {
  serveViewerReads,
  signedInSession,
  signedOutSession,
  VIEWER_PDS,
} from '@/test/person';
import { renderInRouter } from '@/test/router';

import { VisitorActions } from './VisitorActions';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignIn: vi.fn(() => Promise.resolve()),
  startSignUp: vi.fn(() => Promise.resolve()),
}));

const actions = (path: string, owner = false) =>
  renderInRouter(
    <VisitorActions did={ADA.did} handle="alice.test" owner={owner} />,
    path
  );

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedOutSession());
});

describe('VisitorActions when signed out', () => {
  it.each(['/@alice.test', `/d/${ADA.did}`])(
    'offers Bluesky, sign-in and sign-up on %s',
    async (path) => {
      const { container } = actions(path);
      expect(
        await screen.findByRole('link', {
          name: 'Follow on Bluesky (opens in a new tab)',
        })
      ).toHaveAttribute('href', 'https://bsky.app/profile/alice.test');
      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
        'href',
        `/?returnTo=${encodeURIComponent(path)}`
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Create account' })
      );
      expect(startSignUp).toHaveBeenCalledWith(path);
      await expectNoAxeViolations(container);
    }
  );
});

describe('VisitorActions when signed in', () => {
  it('shows Follow for someone else', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
    serveViewerReads({
      relationship: { followedBy: `at://${ADA.did}/app.bsky.graph.follow/3m` },
    });
    actions('/@alice.test');
    const follow = await screen.findByRole('button', { name: 'Follow' });
    await waitFor(() => expect(follow).toBeEnabled());
  });

  it('asks for permission before following with an identity-only session', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did, 'atproto'));
    actions('/@alice.test');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Follow' })
    );
    expect(
      screen.getByRole('heading', { name: 'Lanyards needs your permission' })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Give permission' })
    );
    expect(startSignIn).toHaveBeenCalledWith(BEA.did, '/@alice.test');
  });

  it('disables Follow when it could not check the relationship', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did));
    server.use(
      http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    actions('/@alice.test');
    const follow = await screen.findByRole('button', { name: 'Follow' });
    expect(
      await screen.findByText(
        "Couldn't check whether you already follow them",
        undefined,
        { timeout: 4000 }
      )
    ).toBeInTheDocument();
    expect(follow).toBeDisabled();
  });

  it('says it is your own lanyard instead of offering Follow', async () => {
    vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
    actions('/@alice.test', true);
    expect(await screen.findByText('This is your lanyard')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Follow' })
    ).not.toBeInTheDocument();
  });
});
