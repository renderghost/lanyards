import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  it('is unavailable and marked busy while loading, keeping focus', () => {
    const onClick = vi.fn();
    const { rerender } = renderWithProviders(
      <Button onClick={onClick}>Sign in</Button>
    );
    const button = screen.getByRole('button', { name: 'Sign in' });
    button.focus();
    rerender(
      <Button loading onClick={onClick}>
        Sign in
      </Button>
    );
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('never submits its form while loading', () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    renderWithProviders(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Button type="submit" loading>
          Save
        </Button>
      </form>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('is truly disabled when disabled', () => {
    renderWithProviders(<Button disabled>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
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
