import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { servePerson, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { qrUrl } from '../../qrUrl';
import { ShowQrButton } from './ShowQrButton';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const release = vi.fn(async () => undefined);
const request = vi.fn(async () => ({
  release,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  servePerson();
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request },
    configurable: true,
  });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'wakeLock');
});

const open = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Show QR' }));
  return screen.findByRole(
    'dialog',
    { name: 'Ada Example' },
    { timeout: 5000 }
  );
};

describe('ShowQrButton', () => {
  it('opens a sheet with the owner’s name and QR code', async () => {
    renderWithClient(<ShowQrButton />);
    const sheet = await open();
    expect(sheet).toHaveTextContent('Scan to see my lanyard');
    expect(
      screen.getByRole('img', { name: `QR code for ${qrUrl(ADA.did)}` })
    ).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('qr_opened');
  });

  it('copies the link as a text alternative', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderWithClient(<ShowQrButton />);
    await user.click(screen.getByRole('button', { name: 'Show QR' }));
    await screen.findByRole(
      'dialog',
      { name: 'Ada Example' },
      { timeout: 5000 }
    );
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(qrUrl(ADA.did));
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Link copied')
    );
  });

  it('says so and reports it when copying fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(
      new Error('Denied')
    );
    renderWithClient(<ShowQrButton />);
    await user.click(screen.getByRole('button', { name: 'Show QR' }));
    await screen.findByRole(
      'dialog',
      { name: 'Ada Example' },
      { timeout: 5000 }
    );
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        "Couldn't copy the link. Please try again."
      )
    );
    expect(captureError).toHaveBeenCalledWith(new Error('Denied'), {
      source: 'copy-link',
    });
  });

  it('closes on Escape and returns focus to the button', async () => {
    renderWithClient(<ShowQrButton />);
    await open();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Show QR' })).toHaveFocus();
  });

  it('keeps the screen awake while open', async () => {
    renderWithClient(<ShowQrButton />);
    await open();
    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(release).toHaveBeenCalled());
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = renderWithClient(<ShowQrButton />);
    await open();
    await expectNoAxeViolations(baseElement as HTMLElement);
  });
});
