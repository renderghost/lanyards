import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ItemActionsContext } from '../itemActions';
import { ItemFrame } from './ItemFrame';

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

  it('adds the customiser’s menu beside the item', () => {
    const renderMenu = vi.fn((key: string, title: string) => (
      <button type="button">{`Menu for ${title} (${key})`}</button>
    ));
    renderWithProviders(
      <ItemActionsContext value={{ renderMenu }}>
        <ItemFrame itemKey="k1" title="Keynote">
          <p>Keynote</p>
        </ItemFrame>
      </ItemActionsContext>
    );
    expect(
      screen.getByRole('button', { name: 'Menu for Keynote (k1)' })
    ).toBeInTheDocument();
    expect(screen.getByText('Keynote')).toBeInTheDocument();
  });
});
