import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { ToggleGroup } from './ToggleGroup';

type Mode = 'edit' | 'public';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'public', label: 'View as public' },
];

function Harness({ onChange }: { onChange?: (value: Mode) => void }) {
  const [value, setValue] = useState<Mode>('edit');
  return (
    <ToggleGroup
      label="Mode"
      value={value}
      onValueChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
      options={OPTIONS}
    />
  );
}

const option = (name: string) => screen.getByRole('button', { name });

describe('ToggleGroup', () => {
  it('offers each option as a toggle button in a named group', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument();
    expect(option('Edit')).toHaveAttribute('aria-pressed', 'true');
    expect(option('View as public')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('presses the option chosen', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(option('View as public'));
    expect(option('View as public')).toHaveAttribute('aria-pressed', 'true');
    expect(option('Edit')).toHaveAttribute('aria-pressed', 'false');
  });

  it('is one tab stop, and the arrow keys move between options', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    await userEvent.tab();
    expect(option('Edit')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(option('View as public')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('public');
  });

  it('keeps the value when the pressed option is pressed again', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    await userEvent.click(option('Edit'));
    expect(onChange).not.toHaveBeenCalled();
    expect(option('Edit')).toHaveAttribute('aria-pressed', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Harness />);
    await expectNoAxeViolations(container);
  });
});
