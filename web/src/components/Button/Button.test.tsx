import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { cn } from '@/lib/utils';
import { expectNoAxeViolations } from '@/test/axe';
import { hitHeight } from '@/test/hitArea';
import { renderWithProviders } from '@/test/render';

import { Button } from './Button';
import { base, sizes, tones } from './Button.styles';

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

  it('uses the product UI primary by default', () => {
    renderWithProviders(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).className).toContain(
      'bg-ui-primary'
    );
  });

  it('uses the lanyard accent with tone="accent"', () => {
    renderWithProviders(<Button tone="accent">Follow</Button>);
    const button = screen.getByRole('button', { name: 'Follow' });
    expect(button.className).toContain('bg-accent');
    expect(button.className).not.toContain('bg-ui-primary');
  });

  it('is 36px tall at the small size', () => {
    renderWithProviders(<Button size="sm">Reset</Button>);
    expect(screen.getByRole('button', { name: 'Reset' }).className).toContain(
      'min-h-9'
    );
  });

  it.each(
    (['ui', 'accent'] as const).flatMap((tone) =>
      (['primary', 'secondary', 'ghost'] as const).flatMap((variant) =>
        (['sm', 'md', 'lg'] as const).map((size) => ({ tone, variant, size }))
      )
    )
  )(
    'has a hit area at least 44px tall ($tone $variant $size)',
    ({ tone, variant, size }) => {
      expect(
        hitHeight(cn(base, tones[tone][variant], sizes[size]))
      ).toBeGreaterThanOrEqual(44);
    }
  );

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
