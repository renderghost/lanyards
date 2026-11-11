import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { ItemMenu } from './ItemMenu';

describe('ItemMenu', () => {
  it('offers to hide the item it is for', async () => {
    const onHide = vi.fn(() => true);
    renderWithProviders(<ItemMenu title="Keynote" onHide={onHide} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'More options for Keynote' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Hide this item' })
    );
    expect(onHide).toHaveBeenCalledOnce();
  });

  it('returns focus to its button when the item isn’t hidden', async () => {
    renderWithProviders(<ItemMenu title="Keynote" onHide={() => false} />);
    const trigger = screen.getByRole('button', {
      name: 'More options for Keynote',
    });
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Hide this item' })
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <ItemMenu title="Keynote" onHide={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
