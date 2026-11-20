import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { ContactLinks } from './ContactLinks';

vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const board = {
  uri: 'at://did:plc:ua3d6biqepazbq6mw4ysotfo/app.userinput.space/3mnew',
  cid: `bafyrei${'c'.repeat(52)}`,
  name: 'Lanyards feedback',
  tags: [],
  url: 'https://userinput.app/s/did:plc:ua3d6biqepazbq6mw4ysotfo/3mnew',
};

describe('ContactLinks (#134)', () => {
  it('links to our board, our Bluesky and our Signal', async () => {
    const { container } = renderWithProviders(<ContactLinks board={board} />);
    expect(
      screen.getByRole('link', {
        name: 'See our feedback board (opens in a new tab)',
      })
    ).toHaveAttribute('href', board.url);
    expect(
      screen.getByRole('link', {
        name: 'Follow @lanyards.app on Bluesky (opens in a new tab)',
      })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
    expect(screen.getByText('renderghost.101')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('has no board link without a board', () => {
    renderWithProviders(<ContactLinks board={null} />);
    expect(screen.queryByRole('link', { name: /feedback board/ })).toBeNull();
    expect(
      screen.getByRole('link', { name: /lanyards\.app on Bluesky/ })
    ).toBeInTheDocument();
  });

  it('copies the Signal username', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderWithProviders(<ContactLinks board={null} />);
    await user.click(
      screen.getByRole('button', { name: 'Copy Signal username' })
    );
    expect(writeText).toHaveBeenCalledWith('renderghost.101');
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Signal username copied')
    );
  });
});
