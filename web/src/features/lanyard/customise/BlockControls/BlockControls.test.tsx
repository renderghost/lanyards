import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockControls } from './BlockControls';
import type { BlockControlsProps } from './BlockControls.types';

function renderControls(props: Partial<BlockControlsProps> = {}) {
  const handlers = {
    onMove: vi.fn(),
    onVisibleChange: vi.fn(),
    onLimitChange: vi.fn(),
  };
  const view = renderWithProviders(
    <BlockControls
      type="links"
      index={0}
      total={3}
      visible
      disabled={false}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers, ...view };
}

describe('BlockControls', () => {
  it('names every control after its block', () => {
    renderControls();
    for (const name of ['Move Links up', 'Move Links down']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('switch', { name: 'Show Links' })).toBeChecked();
  });

  it('keeps Move up focusable but unavailable at the top', async () => {
    const { onMove } = renderControls();
    const up = screen.getByRole('button', { name: 'Move Links up' });
    expect(up).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(up);
    expect(onMove).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Move Links down' })
    );
    expect(onMove).toHaveBeenCalledWith(1);
  });

  it('shows or hides the block', async () => {
    const { onVisibleChange } = renderControls();
    await userEvent.click(screen.getByRole('switch', { name: 'Show Links' }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('offers a count only for counted blocks', async () => {
    const { onLimitChange, unmount } = renderControls({
      type: 'blogPosts',
      limit: 3,
    });
    const count = screen.getByRole('combobox', {
      name: 'Items to show for Articles',
    });
    await userEvent.selectOptions(count, '5');
    expect(onLimitChange).toHaveBeenCalledWith(5);
    unmount();
    renderControls({ type: 'talks' });
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderControls({ type: 'code', limit: 3 });
    await expectNoAxeViolations(container);
  });
});
