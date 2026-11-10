import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Logo } from './Logo';

describe('Logo', () => {
  it('has the accessible name "Lanyards"', () => {
    renderWithProviders(<Logo />);
    expect(screen.getByRole('img', { name: 'Lanyards' })).toBeInTheDocument();
  });

  it('switches to the dark logo in dark mode', () => {
    const { container } = renderWithProviders(<Logo />);
    const source = container.querySelector('source');
    expect(source).toHaveAttribute('srcset', '/logo-dark.svg');
    expect(source).toHaveAttribute('media', '(prefers-color-scheme: dark)');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Logo />);
    await expectNoAxeViolations(container);
  });
});
