import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { CoverPicker } from './CoverPicker';

const NAMES = [
  'Dots',
  'Stripes',
  'Pixels',
  'Orb',
  'Symbols',
  'Hazard',
  'Arrows',
  'Monogram',
];

describe('CoverPicker', () => {
  it('offers the eight covers as a named radio group, each a live preview', () => {
    const { container } = renderWithProviders(
      <CoverPicker value="orb" initials="AE" onChange={vi.fn()} />
    );
    const group = screen.getByRole('radiogroup', { name: 'Cover' });
    expect(within(group).getAllByRole('radio')).toHaveLength(8);
    for (const name of NAMES) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('radio', { name: 'Orb' })).toBeChecked();
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(
      8
    );
  });

  it('reports the cover the owner chooses', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CoverPicker value="orb" initials="AE" onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Pixels' }));
    expect(onChange).toHaveBeenCalledWith('pixels');
  });

  it('can be disabled', () => {
    renderWithProviders(
      <CoverPicker value="orb" initials="AE" onChange={vi.fn()} disabled />
    );
    expect(screen.getByRole('radio', { name: 'Dots' })).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <CoverPicker value="orb" initials="AE" onChange={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
