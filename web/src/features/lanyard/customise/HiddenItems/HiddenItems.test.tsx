import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
  { key: GONE },
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

  it('shows nothing when no item is hidden', () => {
    const { container } = renderWithProviders(
      <HiddenItems items={[]} onShow={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <HiddenItems items={items as never} onShow={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
