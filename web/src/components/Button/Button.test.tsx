import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Button } from './Button';

describe('Button', () => {
  it('meets the 44px minimum touch target at the default size', () => {
    renderWithProviders(<Button>Sign in</Button>);
    expect(screen.getByRole('button', { name: 'Sign in' }).className).toContain(
      'min-h-11'
    );
  });

  it('uses the 56px target at the large size', () => {
    renderWithProviders(<Button size="lg">Connect</Button>);
    expect(screen.getByRole('button', { name: 'Connect' }).className).toContain(
      'min-h-14'
    );
  });

  it('is disabled and marked busy while loading', () => {
    renderWithProviders(<Button loading>Sign in</Button>);
    const button = screen.getByRole('button', { name: 'Sign in' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    renderWithProviders(<Button>Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'type',
      'button'
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Button loading>Save</Button>);
    await expectNoAxeViolations(container);
  });
});
