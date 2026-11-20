import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { qrUrl } from '@/features/qr/qrUrl';
import { captureError, track } from '@/lib/analytics/analytics';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { servePerson, signedInSession, signedOutSession } from '@/test/person';
import { renderRoute, waitForRoute } from '@/test/router';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const SHARE = `/${ADA.handle}/share`;

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

const badge = () =>
  screen.findByRole('dialog', { name: 'Dr Ada Example' }, { timeout: 5000 });

describe('/<handle>/share (#150)', { timeout: 20_000 }, () => {
  it('shows the QR badge full screen, with no app header', async () => {
    renderRoute(SHARE);
    expect(await badge()).toHaveTextContent('Scan to see my lanyard');
    expect(
      screen.getByRole('img', { name: `QR code for ${qrUrl(ADA.did)}` })
    ).toBeInTheDocument();
    expect(screen.queryByRole('banner')).toBeNull();
    expect(track).toHaveBeenCalledWith('qr_opened');
  });

  it('works for anyone’s lanyard, signed in or not', async () => {
    vi.mocked(useSession).mockReturnValue(signedOutSession());
    renderRoute(SHARE);
    expect(await badge()).toBeInTheDocument();
  });

  it('copies the link, saying so when it can’t', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    renderRoute(SHARE);
    await badge();
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(qrUrl(ADA.did));
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Link copied')
    );

    writeText.mockRejectedValueOnce(new Error('Denied'));
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

  it('goes back to where you were on Close', async () => {
    const { router } = renderRoute([`/${ADA.handle}/edit`, SHARE]);
    await badge();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitForRoute(router, `/${ADA.handle}/edit`, 5000);
  });

  it('goes to the lanyard on Escape when opened directly', async () => {
    const { router } = renderRoute(SHARE);
    await badge();
    await userEvent.keyboard('{Escape}');
    await waitForRoute(router, `/${ADA.handle}`, 5000);
  });

  it('keeps the screen awake while it’s open', async () => {
    renderRoute(SHARE);
    await badge();
    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
  });

  it('has no axe violations', async () => {
    const { baseElement } = renderRoute(SHARE);
    await badge();
    await expectNoAxeViolations(baseElement as HTMLElement);
  });
});
