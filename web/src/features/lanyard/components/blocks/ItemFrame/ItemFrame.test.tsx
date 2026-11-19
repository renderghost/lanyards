import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { type ItemActions, ItemActionsContext } from '../itemActions';
import { ItemFrame } from './ItemFrame';

const actions = (hidden: string[]): ItemActions => ({
  isHidden: (key) => hidden.includes(key),
  renderToggle: (key, title) => (
    <button type="button">{`Toggle ${title} (${key})`}</button>
  ),
});

describe('ItemFrame', () => {
  it('renders just the item outside the customiser', () => {
    const { container } = renderWithProviders(
      <ul>
        <li>
          <ItemFrame itemKey="k" title="Keynote">
            <p>Keynote</p>
          </ItemFrame>
        </li>
      </ul>
    );
    expect(container.querySelector('li')?.innerHTML).toBe('<p>Keynote</p>');
  });

  it('adds the customiser’s show/hide control beside the item', () => {
    const renderToggle = vi.fn(actions([]).renderToggle);
    renderWithProviders(
      <ItemActionsContext value={{ ...actions([]), renderToggle }}>
        <ItemFrame itemKey="k1" title="Keynote">
          <p>Keynote</p>
        </ItemFrame>
      </ItemActionsContext>
    );
    expect(
      screen.getByRole('button', { name: 'Toggle Keynote (k1)' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('marks a hidden item and keeps it in place', () => {
    renderWithProviders(
      <ItemActionsContext value={actions(['k1'])}>
        <ul>
          <li>
            <ItemFrame itemKey="k1" title="Keynote">
              <p>Keynote</p>
            </ItemFrame>
          </li>
        </ul>
      </ItemActionsContext>
    );
    const item = screen.getByText('Keynote');
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(item.closest('li')).not.toBeNull();
    expect(item.closest('[data-hidden="true"]')).not.toBeNull();
  });
});
