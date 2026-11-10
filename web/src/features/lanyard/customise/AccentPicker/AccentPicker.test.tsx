import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { AccentPicker } from './AccentPicker';

const NAMES = [
  'Violet',
  'Indigo',
  'Plum',
  'Rose',
  'Ember',
  'Moss',
  'Teal',
  'Ocean',
];

describe('AccentPicker', () => {
  it('offers the eight accents as a named radio group', () => {
    renderWithProviders(<AccentPicker value="violet" onChange={vi.fn()} />);
    const group = screen.getByRole('radiogroup', { name: 'Accent colour' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
    for (const name of NAMES) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument();
      expect(screen.getByText(name)).toBeVisible();
    }
    expect(screen.getByRole('radio', { name: 'Violet' })).toBeChecked();
  });

  it('reports the accent the owner chooses', async () => {
    const onChange = vi.fn();
    renderWithProviders(<AccentPicker value="violet" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Teal' }));
    expect(onChange).toHaveBeenCalledWith('teal');
  });

  it('can be disabled', () => {
    renderWithProviders(
      <AccentPicker value="violet" onChange={vi.fn()} disabled />
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <AccentPicker value="moss" onChange={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
