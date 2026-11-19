import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { HiddenItem } from '@/lib/person/blocks';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { HiddenItems } from './HiddenItems';

const TALK =
  'at://did:plc:fixturealiceaaaaaaaaaaaa/id.sifa.profile.presentationDelivery/d1';
const GONE = 'at://did:plc:fixturealiceaaaaaaaaaaaa/app.lanyards.link.web/gone';

const items = [
  {
    key: TALK,
    type: 'talks' as const,
    item: { key: TALK, title: 'Keynote' },
  },
  { key: GONE, reason: 'gone' },
];

describe('HiddenItems', () => {
  it('lists hidden items, each with Show again', async () => {
    const onShow = vi.fn();
    renderWithProviders(<HiddenItems items={items as never} onShow={onShow} />);
    const region = screen.getByRole('region', { name: 'Hidden items' });
    const entries = within(region).getAllByRole('listitem');
    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringContaining('Keynote'),
      expect.stringContaining('An item that is no longer available'),
    ]);
    const show = within(entries[0]!).getByRole('button', {
      name: 'Show again',
    });
    expect(show).toHaveAccessibleDescription('Keynote');
    await userEvent.click(show);
    expect(onShow).toHaveBeenCalledWith(TALK);
  });

  it('says which block a missing item is in, and why it’s missing', () => {
    renderWithProviders(
      <HiddenItems
        items={[
          { key: 'a', type: 'code', reason: 'off' },
          { key: 'b', type: 'blogPosts', reason: 'failed' },
          { key: 'c', type: 'bskyPosts', reason: 'loading' },
          { key: 'd', type: 'talks', reason: 'gone' },
        ]}
        onShow={vi.fn()}
      />
    );
    expect(
      screen.getAllByRole('listitem').map((entry) => entry.textContent)
    ).toEqual([
      expect.stringContaining('An item in Code, which is switched off'),
      expect.stringContaining("An item in Blog posts, which didn't load"),
      expect.stringContaining('An item in Posts on Bluesky, still loading'),
      expect.stringContaining('An item in Talks that is no longer available'),
    ]);
  });

  it('clamps a long title to two lines', () => {
    const long = 'x'.repeat(5000);
    renderWithProviders(
      <HiddenItems
        items={[{ key: TALK, type: 'talks', item: { key: TALK, title: long } }]}
        onShow={vi.fn()}
      />
    );
    expect(screen.getByText(long)).toHaveClass('line-clamp-2');
  });

  it('says when no item is hidden', () => {
    renderWithProviders(<HiddenItems items={[]} onShow={vi.fn()} />);
    expect(
      within(screen.getByRole('region', { name: 'Hidden items' })).getByText(
        'No items are hidden.'
      )
    ).toBeInTheDocument();
  });

  it('moves focus to the next item, then to the empty list, as items are shown', async () => {
    function Harness() {
      const [shown, setShown] = useState<HiddenItem[]>(items as never);
      return (
        <HiddenItems
          items={shown}
          onShow={(key) =>
            setShown((current) => current.filter((entry) => entry.key !== key))
          }
        />
      );
    }
    renderWithProviders(<Harness />);
    const [first] = screen.getAllByRole('button', { name: 'Show again' });
    await userEvent.click(first!);
    const [next] = screen.getAllByRole('button', { name: 'Show again' });
    expect(next).toHaveFocus();
    expect(next).toHaveAccessibleDescription(
      'An item that is no longer available'
    );
    await userEvent.click(next!);
    expect(screen.getByText('No items are hidden.')).toHaveFocus();
  });

  it('can be told which entry to focus, after an item is hidden', () => {
    renderWithProviders(
      <HiddenItems items={items as never} onShow={vi.fn()} focusKey={TALK} />
    );
    expect(
      screen.getByRole('button', { name: 'Show again', description: 'Keynote' })
    ).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <HiddenItems items={items as never} onShow={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
