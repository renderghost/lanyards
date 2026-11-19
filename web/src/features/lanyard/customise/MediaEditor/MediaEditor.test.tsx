import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
import type {
  LanyardRecords,
  MediaLink,
} from '@/lib/sources/lanyards/lanyards.types';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';
import { MediaEditor } from './MediaEditor';

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

const EPISODE: MediaLink = {
  key: 'at://did:plc:ada/app.lanyards.link.media.audio/3maud1',
  kind: 'audio',
  url: 'https://pod.example/1',
  platform: 'spotify',
  title: 'Episode one',
};

function renderEditor(draft = records()) {
  const view = renderWithProviders(
    <ItemActionsContext value={ACTIONS}>
      <MediaEditor items={[EPISODE]} records={draft} disabled={false} />
    </ItemActionsContext>
  );
  return { draft, ...view };
}

describe('MediaEditor', () => {
  it('edits an episode in place', async () => {
    const { draft } = renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit Episode one' })
    );
    const title = screen.getByRole('textbox', { name: 'Title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'Episode 1');
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(draft.updateMedia).toHaveBeenCalledWith(EPISODE.key, {
      kind: 'audio',
      url: 'https://pod.example/1',
      platform: 'spotify',
      title: 'Episode 1',
    });
  });

  it('deletes an episode', async () => {
    const { draft } = renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Episode one' })
    );
    expect(draft.removeMedia).toHaveBeenCalledWith(EPISODE.key);
  });

  it('adds a podcast or video in place', async () => {
    const { draft } = renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add a podcast or video' })
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Web address' }),
      'https://pod.example/2'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Platform' }),
      'spotify'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
    expect(draft.addMedia).toHaveBeenCalledWith({
      kind: 'audio',
      url: 'https://pod.example/2',
      platform: 'spotify',
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderEditor();
    await expectNoAxeViolations(container);
  });
});
