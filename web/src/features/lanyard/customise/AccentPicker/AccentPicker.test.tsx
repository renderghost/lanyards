import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { AccentPicker } from './AccentPicker';

const NAMES = ['Blue', 'Mint', 'Lime', 'Pink'];

describe('AccentPicker', () => {
  it('offers the four brand accents as a named radio group', () => {
    renderWithProviders(<AccentPicker value="blue" onChange={vi.fn()} />);
    const group = screen.getByRole('radiogroup', { name: 'Accent colour' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const name of NAMES) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument();
      expect(screen.getByText(name)).toBeVisible();
    }
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
  });

  it('reports the accent the owner chooses', async () => {
    const onChange = vi.fn();
    renderWithProviders(<AccentPicker value="blue" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Mint' }));
    expect(onChange).toHaveBeenCalledWith('mint');
  });

  it('can be disabled', () => {
    renderWithProviders(
      <AccentPicker value="blue" onChange={vi.fn()} disabled />
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('can hide its heading visually, keeping the group’s name', () => {
    renderWithProviders(
      <AccentPicker value="blue" onChange={vi.fn()} hideLabel />
    );
    expect(
      screen.getByRole('radiogroup', { name: 'Accent colour' })
    ).toBeInTheDocument();
    expect(screen.getByText('Accent colour')).toHaveClass('sr-only');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <AccentPicker value="lime" onChange={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
