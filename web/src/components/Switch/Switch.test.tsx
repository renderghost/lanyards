import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Switch } from './Switch';

describe('Switch', () => {
  it('is a switch named by its label, whose state follows checked', () => {
    const { rerender } = renderWithProviders(
      <Switch checked={false} onCheckedChange={vi.fn()} label="Show Links" />
    );
    const toggle = screen.getByRole('switch', { name: 'Show Links' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    rerender(<Switch checked onCheckedChange={vi.fn()} label="Show Links" />);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('turns on with Space', async () => {
    const onCheckedChange = vi.fn();
    renderWithProviders(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        label="Show Links"
      />
    );
    screen.getByRole('switch', { name: 'Show Links' }).focus();
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('ignores presses while disabled', async () => {
    const onCheckedChange = vi.fn();
    renderWithProviders(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        label="Show Links"
        disabled
      />
    );
    const toggle = screen.getByRole('switch', { name: 'Show Links' });
    expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Switch checked onCheckedChange={vi.fn()} label="Show Links" />
    );
    await expectNoAxeViolations(container);
  });
});
