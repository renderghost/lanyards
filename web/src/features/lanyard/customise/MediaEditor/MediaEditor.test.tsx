import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';
import { MediaEditor } from './MediaEditor';

const records = () =>
  ({
    records: { media: [] },
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

const EPISODE: MediaLink = {
  key: 'at://did:plc:ada/app.lanyards.link.media.audio/3maud1',
  kind: 'audio',
  url: 'https://pod.example/1',
  platform: 'spotify',
  title: 'Episode one',
};

function renderEditor(draft = records(), disabled = false) {
  const view = renderWithProviders(
    <ItemActionsContext value={ACTIONS}>
      <MediaEditor items={[EPISODE]} records={draft} disabled={disabled} />
    </ItemActionsContext>
  );
  return { draft, ...view };
}

const addButton = () =>
  screen.getByRole('button', { name: 'Add a podcast or video' });

async function fillNewEpisode() {
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Web address' }),
    'https://pod.example/2'
  );
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Platform' }),
    'spotify'
  );
}

describe('MediaEditor', () => {
  it('Add opens a dialog; a valid entry closes it, joins the draft and focus returns to Add', async () => {
    const { draft } = renderEditor();
    await userEvent.click(addButton());
    expect(
      screen.getByRole('dialog', { name: 'Add a podcast or video' })
    ).toBeInTheDocument();
    await fillNewEpisode();
    await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
    expect(draft.addMedia).toHaveBeenCalledWith({
      kind: 'audio',
      url: 'https://pod.example/2',
      platform: 'spotify',
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(addButton()).toHaveFocus());
    expect(screen.getByRole('status')).toHaveTextContent('pod.example added');
  });

  it('Edit opens the dialog filled in; Update closes it and focus returns to Edit', async () => {
    const { draft } = renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit Episode one' })
    );
    expect(
      screen.getByRole('dialog', { name: 'Edit Episode one' })
    ).toBeInTheDocument();
    const title = screen.getByRole('textbox', { name: 'Title' });
    expect(title).toHaveValue('Episode one');
    await userEvent.clear(title);
    await userEvent.type(title, 'Episode 1');
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(draft.updateMedia).toHaveBeenCalledWith(EPISODE.key, {
      kind: 'audio',
      url: 'https://pod.example/1',
      platform: 'spotify',
      title: 'Episode 1',
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Edit Episode one' })
      ).toHaveFocus()
    );
  });

  it('Cancel discards what was typed', async () => {
    const { draft } = renderEditor();
    await userEvent.click(addButton());
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Web address' }),
      'https://half.example/'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(addButton());
    expect(screen.getByRole('textbox', { name: 'Web address' })).toHaveValue(
      ''
    );
    expect(draft.addMedia).not.toHaveBeenCalled();
  });

  it('Delete removes the entry, says so and focuses Add', async () => {
    const { draft } = renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Episode one' })
    );
    expect(draft.removeMedia).toHaveBeenCalledWith(EPISODE.key);
    expect(screen.getByRole('status')).toHaveTextContent('Episode one deleted');
    await waitFor(() => expect(addButton()).toHaveFocus());
  });

  it('while saving, Add and Edit do nothing, and an open form can’t submit', async () => {
    const draft = records();
    const view = renderWithProviders(
      <ItemActionsContext value={ACTIONS}>
        <MediaEditor items={[EPISODE]} records={draft} disabled={false} />
      </ItemActionsContext>
    );
    await userEvent.click(addButton());
    view.rerender(
      <ItemActionsContext value={ACTIONS}>
        <MediaEditor items={[EPISODE]} records={draft} disabled />
      </ItemActionsContext>
    );
    expect(screen.getByRole('button', { name: 'Add media' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(addButton()).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit Episode one' })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has no axe violations with the dialog open', async () => {
    renderEditor();
    await userEvent.click(addButton());
    await expectNoAxeViolations(document.body);
  });
});
