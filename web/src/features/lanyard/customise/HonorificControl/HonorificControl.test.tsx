import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { HonorificControl } from './HonorificControl';

describe('HonorificControl', () => {
  it('sets the title on the badge', async () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <HonorificControl value="Dr" onChange={onChange} disabled={false} />
    );
    const select = screen.getByRole('combobox', { name: 'Title' });
    expect(select).toHaveValue('Dr');
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['None', 'Dr', 'Prof']);
    await userEvent.selectOptions(select, 'Prof');
    expect(onChange).toHaveBeenCalledWith('Prof');
    await expectNoAxeViolations(container);
  });
});
