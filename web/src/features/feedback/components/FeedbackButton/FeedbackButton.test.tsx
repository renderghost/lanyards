import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

afterEach(() => {
  window.history.replaceState(null, '', '/');
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

  it('reopens itself after the permission sign-in, and tidies the address', async () => {
    window.history.replaceState(null, '', '/settings#feedback');
    renderInRouter(<FeedbackButton autoOpen />, '/settings#feedback');
    expect(
      await screen.findByRole('dialog', { name: 'Send feedback' })
    ).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });

  it('leaves the address alone without autoOpen', async () => {
    window.history.replaceState(null, '', '/settings#feedback');
    renderInRouter(<FeedbackButton />, '/settings#feedback');
    await screen.findByRole('button', { name: 'Send feedback' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
