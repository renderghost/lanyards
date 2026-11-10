import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { notify } from './notify';
import { Toaster } from './Toaster';

describe('Toaster', () => {
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
