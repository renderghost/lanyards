import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { CardLink } from '../CardLink/CardLink';
import { type ItemActions, ItemActionsContext } from '../itemActions';
import { CardItem } from './CardItem';

const actions = (hidden: string[]): ItemActions => ({
  isHidden: (key) => hidden.includes(key),
  renderToggle: (_key, title) => (
    <button type="button">{`Hide ${title}`}</button>
  ),
  renderEdit: (_key, title) => <button type="button">{`Edit ${title}`}</button>,
});

const card = (
  <CardItem itemKey="k1" title="A post" thumbnail={<span>thumb</span>}>
    <CardLink href="https://ada.example/post">A post</CardLink>
    <p>Ada’s notes · 4 Nov 2026</p>
  </CardItem>
);

describe('CardItem', () => {
  it('one link per card, and its focus ring shows on the card', async () => {
    const { container } = renderWithProviders(
      <ul>
        <li>{card}</li>
      </ul>
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    const link = screen.getByRole('link', { name: /A post/ });
    const frame = link.closest('[data-card]');
    expect(frame).toHaveClass('relative', 'has-[a:focus-visible]:outline-2');
    expect(screen.getByText('thumb')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('a card with no link has no pointer', () => {
    renderWithProviders(
      <CardItem itemKey="k2" title="Example University">
        <p>Example University</p>
      </CardItem>
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(
      screen.getByText('Example University').closest('[data-card]')
    ).not.toHaveClass('cursor-pointer');
  });

  it('editor: its controls sit beside the link, never in it', () => {
    renderWithProviders(
      <ItemActionsContext value={actions([])}>{card}</ItemActionsContext>
    );
    const link = screen.getByRole('link', { name: /A post/ });
    for (const name of ['Hide A post', 'Edit A post']) {
      expect(link.contains(screen.getByRole('button', { name }))).toBe(false);
    }
  });

  it('editor: a hidden card tags itself under its text, and its controls can wrap below', () => {
    renderWithProviders(
      <ItemActionsContext value={actions(['k1'])}>{card}</ItemActionsContext>
    );
    const tag = screen.getByText('Hidden');
    const content = screen.getByText('Ada’s notes · 4 Nov 2026').parentElement;
    // In the text column, not beside it, so phones keep the text readable.
    expect(content).toContainElement(tag);
    expect(content).toHaveClass('basis-40');
    expect(content?.closest('[data-card]')).toHaveClass('flex-wrap');
  });

  it('editor: a hidden card stays in place, tagged Hidden', () => {
    renderWithProviders(
      <ItemActionsContext value={actions(['k1'])}>{card}</ItemActionsContext>
    );
    const frame = screen
      .getByRole('link', { name: /A post/ })
      .closest('[data-card]');
    expect(frame).toHaveAttribute('data-hidden', 'true');
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });
});
