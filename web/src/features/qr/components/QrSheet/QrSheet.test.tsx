import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/test/msw';
import { ADA } from '@/test/people';
import { servePerson } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { QrSheet } from './QrSheet';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

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
