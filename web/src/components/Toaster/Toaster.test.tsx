import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { notify } from './notify';
import { Toaster } from './Toaster';

afterEach(() => {
  vi.useRealTimers();
});

describe('Toaster', () => {
  it('keeps toasts with an action until dismissed, with a close button', async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      notify.info('A new version of Lanyards is available', {
        action: { label: 'Reload', onClick: () => undefined },
      });
    });
    await screen.findByText('A new version of Lanyards is available');
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    vi.useFakeTimers();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(
      screen.getByText('A new version of Lanyards is available')
    ).toBeInTheDocument();
  });

  it('keeps toasts clear of the bottom safe area', async () => {
    const { container } = renderWithProviders(<Toaster />);
    act(() => {
      notify.success('Signed out');
    });
    await screen.findByText('Signed out');
    const toaster = container.ownerDocument.querySelector<HTMLElement>(
      '[data-sonner-toaster]'
    );
    expect(toaster?.getAttribute('style')).toContain(
      'env(safe-area-inset-bottom)'
    );
  });

  it('announces success messages in a live region', async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      notify.success('Signed out');
    });
    const message = await screen.findByText('Signed out');
    expect(message.closest('[aria-live]')).not.toBeNull();
  });

  it('shows an action button when one is given', async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      notify.info('A new version of Lanyards is available', {
        action: { label: 'Reload', onClick: () => undefined },
      });
    });
    expect(
      await screen.findByRole('button', { name: 'Reload' })
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Toaster />);
    act(() => {
      notify.error("Couldn't start sign-in. Please try again.");
    });
    await screen.findByText("Couldn't start sign-in. Please try again.");
    await expectNoAxeViolations(container);
  });
});
