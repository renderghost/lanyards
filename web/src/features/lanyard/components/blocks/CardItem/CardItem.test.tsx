import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Counts the link's clicks without leaving the page. */
  const watchLink = () => {
    const opened = vi.fn();
    screen
      .getByRole('link', { name: /A post/ })
      .addEventListener('click', (event) => {
        event.preventDefault();
        opened();
      });
    return opened;
  };
  const meta = () => screen.getByText('Ada’s notes · 4 Nov 2026');

  it('public: a click anywhere on the card opens its link', async () => {
    renderWithProviders(card);
    const opened = watchLink();
    await userEvent.click(meta());
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('public: a click on the link itself opens it once', async () => {
    renderWithProviders(card);
    const opened = watchLink();
    await userEvent.click(screen.getByRole('link', { name: /A post/ }));
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('public: selecting text, or a double-click, opens nothing more', () => {
    renderWithProviders(card);
    const opened = watchLink();
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'notes',
    } as Selection);
    fireEvent.click(meta(), { detail: 1 });
    expect(opened).not.toHaveBeenCalled();
    vi.restoreAllMocks();
    fireEvent.click(meta(), { detail: 1 });
    fireEvent.click(meta(), { detail: 2 });
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('editor: a click on the card opens nothing', async () => {
    renderWithProviders(
      <ItemActionsContext value={actions([])}>{card}</ItemActionsContext>
    );
    const opened = watchLink();
    await userEvent.click(meta());
    expect(opened).not.toHaveBeenCalled();
  });

  it('public: a card with a link shows it can be clicked; one without doesn’t', () => {
    renderWithProviders(
      <>
        {card}
        <CardItem itemKey="k2" title="Example University">
          <p>Example University</p>
        </CardItem>
      </>
    );
    // has-[a]: only a card holding a link gets the pointer.
    expect(meta().closest('[data-card]')).toHaveClass('has-[a]:cursor-pointer');
    expect(
      screen.getByText('Example University').querySelector('a')
    ).toBeNull();
  });

  it('one link per card, and its focus ring shows on the card', async () => {
    const { container } = renderWithProviders(
      <ul>
        <li>{card}</li>
      </ul>
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    const link = screen.getByRole('link', { name: /A post/ });
    const frame = link.closest('[data-card]');
    expect(frame).toHaveClass(
      'relative',
      'has-[a:focus-visible]:outline-2',
      // The page's focus ring: 3:1 on every ground, whatever the accent.
      'has-[a:focus-visible]:outline-focus-ring'
    );
    expect(screen.getByText('thumb')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('public: a card shows a muted arrow; the editor doesn’t (#128)', () => {
    const { unmount } = renderWithProviders(card);
    const arrow = document.querySelector('[data-card-arrow]');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    unmount();
    renderWithProviders(
      <ItemActionsContext value={actions([])}>{card}</ItemActionsContext>
    );
    expect(document.querySelector('[data-card-arrow]')).toBeNull();
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
