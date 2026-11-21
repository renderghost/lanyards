import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { initialsOf } from '@/design/covers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';
import { servePerson } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { QrSheet } from './QrSheet';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

/** Gives the browser a share sheet (Web Share), or takes it away. */
function shareSheet(share?: (data: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, 'share', {
    value: share,
    configurable: true,
    writable: true,
  });
}

const sheet = (open = true) =>
  renderWithClient(
    <QrSheet
      did={ADA.did}
      open={open}
      onOpenChange={vi.fn()}
      returnFocus={vi.fn()}
    />
  );

beforeEach(() => {
  // The page behind is someone else's lanyard, in their accent.
  document.documentElement.dataset.accent = 'mint';
});

afterEach(() => {
  delete document.documentElement.dataset.accent;
  shareSheet(undefined);
  vi.clearAllMocks();
});

describe('QrSheet, the Share badge (#129)', () => {
  it('wears the owner’s accent on the sheet, never on the page', async () => {
    servePerson({ config: { accent: 'pink' } });
    const { rerender } = sheet();
    const dialog = await screen.findByRole('dialog', {
      name: 'Dr Ada Example',
    });
    await waitFor(() =>
      expect(dialog.closest('[data-accent]')).toHaveAttribute(
        'data-accent',
        'pink'
      )
    );
    expect(document.documentElement.dataset.accent).toBe('mint');
    rerender(
      <QrSheet
        did={ADA.did}
        open={false}
        onOpenChange={vi.fn()}
        returnFocus={vi.fn()}
      />
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.documentElement.dataset.accent).toBe('mint');
  });

  it('shows the code at once, before the badge has loaded', () => {
    server.use(
      http.get(
        'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile',
        () => new Promise<never>(() => {})
      )
    );
    sheet();
    expect(
      screen.getByRole('img', { name: /^QR code for / })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Your lanyard' })
    ).toBeInTheDocument();
  });

  it('shows the role, the handle and where they’re based', async () => {
    servePerson();
    sheet();
    const dialog = await screen.findByRole('dialog', {
      name: 'Dr Ada Example',
    });
    expect(
      await screen.findByText('Research Engineer · Example Lab')
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent('she/her · @alice.test');
    expect(dialog).toHaveTextContent('Edinburgh, Scotland, United Kingdom');
    expect(dialog).toHaveTextContent('lanyards.app');
    expect(screen.getByText('Scan to see my lanyard')).toBeInTheDocument();
  });

  it('keeps Copy link and Close', async () => {
    servePerson();
    const onOpenChange = vi.fn();
    renderWithClient(
      <QrSheet
        did={ADA.did}
        open
        onOpenChange={onOpenChange}
        returnFocus={vi.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Copy link' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('QrSheet, a lanyard in a clear sleeve (#169)', () => {
  it('hangs on a lanyard printed with the owner’s handle', async () => {
    servePerson();
    sheet();
    const dialog = await screen.findByRole('dialog', {
      name: 'Dr Ada Example',
    });
    await waitFor(() =>
      expect(dialog.querySelector('textPath')?.textContent).toContain(
        '@alice.test'
      )
    );
  });

  it('puts the owner’s initials in the code’s centre without an avatar', async () => {
    // No Sifa profile and no Bluesky avatar: nothing to show but initials.
    servePerson({ sifa: 'none', profile: { avatar: undefined } });
    sheet();
    const code = await screen.findByRole('img', { name: /^QR code for / });
    const centre = code.parentElement?.querySelector('[aria-hidden="true"]');
    await waitFor(() =>
      expect(centre).toHaveTextContent(initialsOf('Ada Example'))
    );
    expect(code.parentElement?.querySelector('img')).toBeNull();
  });

  it('puts the owner’s avatar in the code’s centre', async () => {
    servePerson({
      profile: {
        avatar:
          'https://cdn.bsky.app/img/avatar/plain/did:plc:ada/bafkavatar@jpeg',
      },
    });
    sheet();
    const code = await screen.findByRole('img', { name: /^QR code for / });
    await waitFor(() =>
      expect(
        code.parentElement?.querySelector('img')?.getAttribute('src')
      ).toContain('cdn.bsky.app')
    );
  });

  it('falls back to the initials when the avatar won’t load', async () => {
    servePerson();
    sheet();
    const code = await screen.findByRole('img', { name: /^QR code for / });
    const avatar = await waitFor(() => {
      const image = code.parentElement?.querySelector('img');
      expect(image).not.toBeNull();
      return image as HTMLImageElement;
    });
    fireEvent.error(avatar);
    await waitFor(() =>
      expect(code.parentElement?.querySelector('img')).toBeNull()
    );
    expect(
      code.parentElement?.querySelector('[aria-hidden="true"]')
    ).toHaveTextContent(/^[A-Z]{1,2}$/);
  });

  it('opens the device’s share sheet with the lanyard’s link', async () => {
    const share = vi.fn(async (_data: ShareData) => undefined);
    shareSheet(share);
    servePerson();
    sheet();
    await screen.findByRole('dialog', { name: 'Dr Ada Example' });
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(`/d/${ADA.did}`),
      })
    );
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('offers no Share where the device has no share sheet', async () => {
    shareSheet(undefined);
    servePerson();
    sheet();
    await screen.findByRole('dialog', { name: 'Dr Ada Example' });
    expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Copy link' })
    ).toBeInTheDocument();
  });

  it('says nothing when sharing is cancelled, and says so when it fails', async () => {
    const share = vi
      .fn<(data: ShareData) => Promise<void>>()
      .mockRejectedValueOnce(new DOMException('Cancelled', 'AbortError'))
      .mockRejectedValueOnce(new Error('No targets'));
    shareSheet(share);
    servePerson();
    sheet();
    await screen.findByRole('dialog', { name: 'Dr Ada Example' });
    const button = screen.getByRole('button', { name: 'Share' });
    await userEvent.click(button);
    expect(notify.error).not.toHaveBeenCalled();
    await userEvent.click(button);
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        "Couldn't open sharing. Copy the link instead."
      )
    );
  });
});
