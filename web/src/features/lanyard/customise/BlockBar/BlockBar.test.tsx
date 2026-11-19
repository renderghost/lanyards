import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockBar } from './BlockBar';
import type { BlockBarProps } from './BlockBar.types';

function renderBar(props: Partial<BlockBarProps> = {}) {
  const handlers = {
    onMove: vi.fn(),
    onVisibleChange: vi.fn(),
    onLimitChange: vi.fn(),
  };
  const view = renderWithProviders(
    <BlockBar
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

describe('BlockBar', () => {
  it('names every control after its block', () => {
    renderBar();
    for (const name of ['Reorder Links', 'Move Links up', 'Move Links down']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('switch', { name: 'Show Links' })).toBeChecked();
  });

  it('keeps Move up focusable but unavailable at the top', async () => {
    const { onMove } = renderBar();
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
    const { onVisibleChange } = renderBar();
    await userEvent.click(screen.getByRole('switch', { name: 'Show Links' }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('offers a count only for counted blocks', async () => {
    const { onLimitChange, unmount } = renderBar({
      type: 'blogPosts',
      limit: 3,
    });
    const count = screen.getByRole('combobox', {
      name: 'Items to show for Blog posts',
    });
    await userEvent.selectOptions(count, '5');
    expect(onLimitChange).toHaveBeenCalledWith(5);
    unmount();
    renderBar({ type: 'talks' });
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('says when the block is hidden from visitors', () => {
    renderBar({ visible: false });
    expect(screen.getByText('Hidden from visitors')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderBar({ type: 'code', limit: 3 });
    await expectNoAxeViolations(container);
  });
});
