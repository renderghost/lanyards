import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { BlockStatus } from '@/lib/person/blocks';
import { type LanyardConfig, resolveConfig } from '@/lib/person/config';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlockEditor } from './BlockEditor';

type Statuses = Partial<
  Record<LanyardConfig['blocks'][number]['type'], BlockStatus>
>;

/** Applies each change, as useLanyardConfig does, and records them. */
function Harness({
  statuses = {},
  onSave = vi.fn(),
  onRetry = vi.fn(),
  disabled = false,
}: {
  statuses?: Statuses;
  onSave?: (config: LanyardConfig) => void;
  onRetry?: (type: string) => void;
  disabled?: boolean;
}) {
  const [config, setConfig] = useState(resolveConfig(null));
  return (
    <BlockEditor
      config={config}
      statuses={statuses}
      handle="alice.test"
      disabled={disabled}
      onChange={(patch) =>
        setConfig((current) => {
          const next = patch(current);
          onSave(next);
          return next;
        })
      }
      onRetry={onRetry}
    />
  );
}

const row = (name: string) => screen.getByRole('listitem', { name });
const order = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('data-block'));

describe('BlockEditor', () => {
  it('gives every block a handle, moves, a switch and a limit', () => {
    renderWithProviders(<Harness />);
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    const links = row('Links');
    expect(
      within(links).getByRole('button', { name: 'Reorder Links' })
    ).toBeInTheDocument();
    expect(
      within(links).getByRole('button', { name: 'Move up' })
    ).toBeDisabled();
    expect(
      within(links).getByRole('button', { name: 'Move down' })
    ).toBeEnabled();
    expect(
      within(links).getByRole('switch', { name: 'Show Links' })
    ).toBeChecked();
    const limit = within(links).getByRole('combobox', {
      name: 'Items to show',
    });
    expect(within(limit).getAllByRole('option')).toHaveLength(20);
    expect(limit).toHaveValue('20');
    expect(
      within(row('Talks')).getByRole('combobox', { name: 'Items to show' })
    ).toHaveValue('3');
    expect(
      within(row('Details')).getByRole('button', { name: 'Move down' })
    ).toBeDisabled();
  });

  it('moves a block down, saves and announces where it went', async () => {
    const onSave = vi.fn();
    renderWithProviders(<Harness onSave={onSave} />);
    await userEvent.click(
      within(row('Links')).getByRole('button', { name: 'Move down' })
    );
    expect(order().slice(0, 2)).toEqual(['talks', 'links']);
    expect(
      onSave.mock.lastCall?.[0].blocks
        .slice(0, 2)
        .map((b: { type: string }) => b.type)
    ).toEqual(['talks', 'links']);
    expect(
      screen.getByText('Links moved to position 2 of 12')
    ).toBeInTheDocument();
  });

  it('saves a block’s visibility', async () => {
    const onSave = vi.fn();
    renderWithProviders(<Harness onSave={onSave} />);
    await userEvent.click(
      within(row('Talks')).getByRole('switch', { name: 'Show Talks' })
    );
    expect(
      onSave.mock.lastCall?.[0].blocks.find(
        (b: { type: string }) => b.type === 'talks'
      )
    ).toEqual({ type: 'talks', visible: false });
  });

  it('saves a block’s item limit', async () => {
    const onSave = vi.fn();
    renderWithProviders(<Harness onSave={onSave} />);
    await userEvent.selectOptions(
      within(row('Talks')).getByRole('combobox', { name: 'Items to show' }),
      '5'
    );
    expect(
      onSave.mock.lastCall?.[0].blocks.find(
        (b: { type: string }) => b.type === 'talks'
      )
    ).toEqual({ type: 'talks', visible: true, limit: 5 });
  });

  it('says when a block has nothing to show, and where to add it', () => {
    renderWithProviders(<Harness statuses={{ talks: { status: 'empty' } }} />);
    const talks = row('Talks');
    expect(within(talks).getByText('Nothing to show yet')).toBeInTheDocument();
    expect(
      within(talks).getByRole('link', { name: /Edit on Sifa/ })
    ).toHaveAttribute(
      'href',
      'https://sifa.id/p/alice.test?edit=true#presentations'
    );
  });

  it('says when a source failed, with Retry', async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <Harness
        statuses={{ talks: { status: 'error', sources: ['sifa'] } }}
        onRetry={onRetry}
      />
    );
    const talks = row('Talks');
    expect(within(talks).getByText("Couldn't load Sifa")).toBeInTheDocument();
    await userEvent.click(within(talks).getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledWith('talks');
  });

  it('disables every control when the owner can’t save', () => {
    renderWithProviders(<Harness disabled />);
    const links = row('Links');
    expect(
      within(links).getByRole('button', { name: 'Move down' })
    ).toBeDisabled();
    expect(
      within(links).getByRole('switch', { name: 'Show Links' })
    ).toBeDisabled();
    expect(
      within(links).getByRole('combobox', { name: 'Items to show' })
    ).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Harness statuses={{ talks: { status: 'empty' } }} />
    );
    await expectNoAxeViolations(container);
  });
});
