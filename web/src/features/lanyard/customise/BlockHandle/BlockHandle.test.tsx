import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockHandle } from './BlockHandle';

describe('BlockHandle', () => {
  it('is named after its block', async () => {
    const { container } = renderWithProviders(
      <BlockHandle type="links" disabled={false} />
    );
    expect(screen.getByRole('button', { name: 'Reorder Links' })).toBeEnabled();
    await expectNoAxeViolations(container);
  });

  it('is unavailable while the draft can’t change', () => {
    renderWithProviders(<BlockHandle type="links" disabled />);
    expect(
      screen.getByRole('button', { name: 'Reorder Links' })
    ).toBeDisabled();
  });
});
