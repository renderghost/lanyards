import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { signedOutSession } from '@/test/person';
import { renderInRouter } from '@/test/router';

import { FeedbackButton } from './FeedbackButton';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedOutSession());
});

describe('FeedbackButton (#134)', () => {
  it('opens the feedback dialog', async () => {
    renderInRouter(<FeedbackButton />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Send feedback' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
  });

  it('reopens itself on arriving at #feedback, and tidies the address', async () => {
    const { router } = renderInRouter(
      <FeedbackButton autoOpen />,
      '/settings#feedback'
    );
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/settings');
  });

  it('reopens itself when the sign-in callback sends the person back', async () => {
    // The footer is already mounted on the callback page, which then
    // navigates in the app, without a reload.
    const { router } = renderInRouter(
      <FeedbackButton autoOpen />,
      '/oauth/callback'
    );
    await screen.findByRole('button', { name: 'Send feedback' });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => {
      router.history.replace('/settings#feedback');
    });
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.hash).toBe(''));
  });

  it('leaves the address alone without autoOpen', async () => {
    const { router } = renderInRouter(<FeedbackButton />, '/settings#feedback');
    await screen.findByRole('button', { name: 'Send feedback' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.hash).toBe('feedback');
  });
});
