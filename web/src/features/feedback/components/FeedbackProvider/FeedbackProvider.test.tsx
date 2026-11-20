import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { signedOutSession } from '@/test/person';
import { renderInRouter } from '@/test/router';

import { useFeedback } from '../../useFeedback';
import { FeedbackProvider } from './FeedbackProvider';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedOutSession());
});

/** Somewhere in the app that offers feedback. */
function Trigger() {
  const feedback = useFeedback();
  const button = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={button}
      type="button"
      onClick={() => feedback.show(() => button.current?.focus())}
    >
      Feedback, please
    </button>
  );
}

const app = (path: string) =>
  renderInRouter(
    <FeedbackProvider>
      <Trigger />
    </FeedbackProvider>,
    path
  );

describe('FeedbackProvider (#134)', () => {
  it('opens the one feedback dialog from anywhere that asks', async () => {
    app('/lanyard');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Feedback, please' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
  });

  it('reopens on arriving at #feedback, and tidies the address', async () => {
    const { router } = app('/lanyard#feedback');
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/lanyard');
  });

  it('reopens when the sign-in callback sends the person back', async () => {
    const { router } = app('/oauth/callback');
    await screen.findByRole('button', { name: 'Feedback, please' });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => {
      router.history.replace('/lanyard#feedback');
    });
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.hash).toBe(''));
  });
});
