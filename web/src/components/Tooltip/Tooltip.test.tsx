import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Tooltip } from './Tooltip';

function Harness() {
  return (
    <Tooltip label="Reorder Links">
      <button type="button" aria-label="Reorder Links">
        ⋮⋮
      </button>
    </Tooltip>
  );
}

describe('Tooltip', () => {
  it('shows its label when the trigger gets keyboard focus', async () => {
    renderWithProviders(<Harness />);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Reorder Links'
    );
  });

  it('hides on Escape', async () => {
    renderWithProviders(<Harness />);
    await userEvent.tab();
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('has no axe violations while shown', async () => {
    const { container } = renderWithProviders(<Harness />);
    await userEvent.tab();
    await screen.findByRole('tooltip');
    await expectNoAxeViolations(container);
  });
});
