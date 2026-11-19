import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
import type { LinkItem } from '@/lib/person/personView.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';
import { LinkEditor } from './LinkEditor';

const records = (stored: Partial<LanyardRecords> = {}) =>
  ({
    records: { webLinks: [], media: [], ...stored },
    addLink: vi.fn(),
    updateLink: vi.fn(),
    removeLink: vi.fn(),
    addMedia: vi.fn(),
    updateMedia: vi.fn(),
    removeMedia: vi.fn(),
  }) as unknown as UseKeptRecordsDraft;

const ACTIONS: ItemActions = {
  isHidden: () => false,
  renderToggle: (_key, title) => (
    <button type="button">{`Hide ${title}`}</button>
  ),
};

const OWN: LinkItem = {
  key: 'https://ada.example/',
  url: 'https://ada.example/',
  title: 'Site',
  platform: 'website',
  ownKey: 'at://did:plc:ada/app.lanyards.link.web/3mweb1',
};
const SIFA: LinkItem = {
  key: 'https://mastodon.example/@ada',
  url: 'https://mastodon.example/@ada',
  title: 'Mastodon',
  platform: 'fediverse',
};

const STORED = {
  webLinks: [{ key: OWN.ownKey!, url: 'https://ada.example/', title: 'Site' }],
};

function renderEditor(draft = records(STORED)) {
  const view = renderWithProviders(
    <ItemActionsContext value={ACTIONS}>
      <LinkEditor items={[OWN, SIFA]} records={draft} disabled={false} />
    </ItemActionsContext>
  );
  return { draft, ...view };
}

describe('LinkEditor', () => {
  it('Sifa and Bluesky links can only be hidden', () => {
    renderEditor();
    expect(
      screen.getByRole('button', { name: 'Hide Mastodon' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Mastodon' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Delete Mastodon' })
    ).toBeNull();
  });

  it('edits an own link in place', async () => {
    const { draft } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Site' }));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'Personal site');
    await userEvent.click(screen.getByRole('button', { name: 'Update link' }));
    expect(draft.updateLink).toHaveBeenCalledWith(OWN.ownKey, {
      url: 'https://ada.example/',
      title: 'Personal site',
    });
    expect(screen.getByRole('button', { name: 'Edit Site' })).toHaveFocus();
  });

  it('opens the form at its first field; Cancel goes back to Edit', async () => {
    const { draft } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Site' }));
    expect(screen.getByRole('textbox', { name: 'Web address' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Site');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Edit Site' })).toHaveFocus();
    expect(draft.updateLink).not.toHaveBeenCalled();
  });

  it('deletes an own link, says so and focuses Add', async () => {
    const { draft } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Delete Site' }));
    expect(draft.removeLink).toHaveBeenCalledWith(OWN.ownKey);
    expect(screen.getByRole('status')).toHaveTextContent('Site deleted');
    expect(screen.getByRole('button', { name: 'Add a link' })).toHaveFocus();
  });

  it('while saving, its controls do nothing', async () => {
    const draft = records(STORED);
    renderWithProviders(
      <ItemActionsContext value={ACTIONS}>
        <LinkEditor items={[OWN, SIFA]} records={draft} disabled />
      </ItemActionsContext>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete Site' }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit Site' }));
    expect(draft.removeLink).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Add a link' })).toBeDisabled();
  });

  it('with no links yet, offers Add a link', () => {
    renderWithProviders(
      <ItemActionsContext value={ACTIONS}>
        <LinkEditor items={[]} records={records()} disabled={false} />
      </ItemActionsContext>
    );
    expect(screen.getByText('Nothing to show yet')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add a link' })
    ).toBeInTheDocument();
  });

  it('adds a link in place', async () => {
    const { draft } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Add a link' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Web address' }),
      'https://new.example/'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add link' }));
    expect(draft.addLink).toHaveBeenCalledWith({ url: 'https://new.example/' });
    expect(screen.getByRole('button', { name: 'Add a link' })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = renderEditor();
    await expectNoAxeViolations(container);
  });
});
