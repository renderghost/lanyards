import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { SelectField } from './SelectField';

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

describe('SelectField', () => {
  it('labels the select and lists its options after a prompt', () => {
    renderWithProviders(
      <SelectField
        label="Fruit"
        name="fruit"
        options={options}
        placeholder="Choose a fruit"
        value=""
        onChange={vi.fn()}
        required
      />
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Choose a fruit', 'Apple', 'Banana']);
  });

  it('links its error and marks itself invalid', async () => {
    const { container } = renderWithProviders(
      <SelectField
        label="Fruit"
        name="fruit"
        options={options}
        value=""
        onChange={vi.fn()}
        error="Choose a fruit"
      />
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Choose a fruit');
    await expectNoAxeViolations(container);
  });
});
