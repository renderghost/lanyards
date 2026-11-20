import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { EditorBlock } from '@/lib/person/blocks';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { EditableBlock } from './EditableBlock';

const LINKS: EditorBlock = {
  type: 'links',
  visible: true,
  status: 'ready',
  failedSources: [],
  items: [
    {
      item: {
        key: 'https://ada.example/',
        url: 'https://ada.example/',
        title: 'Website',
        platform: 'website',
      },
      hidden: false,
    },
  ],
};

function renderBlock(
  block: EditorBlock,
  onRetry = vi.fn(),
  slots: { content?: ReactNode; footer?: ReactNode } = {}
) {
  return renderWithProviders(
    <DndContext>
      <SortableContext items={[block.type]}>
        <ul aria-label="Blocks">
          <EditableBlock
            block={block}
            index={0}
            total={1}
            profile="alice.test"
            disabled={false}
            onMove={vi.fn()}
            onVisibleChange={vi.fn()}
            onLimitChange={vi.fn()}
            onRetry={onRetry}
            {...slots}
          />
        </ul>
      </SortableContext>
    </DndContext>
  );
}

describe('EditableBlock', () => {
  it('names the block once, in its header row with its controls', () => {
    renderBlock(LINKS);
    expect(screen.getByRole('switch', { name: 'Show Links' })).toBeChecked();
    const heading = screen.getByRole('heading', { level: 2, name: 'Links' });
    expect(screen.getAllByText('Links')).toEqual([heading]);
    const header = heading.closest('[data-block-header]');
    expect(header).toContainElement(
      screen.getByRole('switch', { name: 'Show Links' })
    );
    expect(header).toContainElement(
      screen.getByRole('button', { name: 'Reorder Links' })
    );
    expect(screen.getByText('Website')).toBeInTheDocument();
  });

  it('collapses to its header row when hidden from visitors', () => {
    renderBlock({ ...LINKS, visible: false });
    expect(screen.getByText('Hidden from visitors')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Links' })
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Links' })).toHaveAttribute(
      'data-collapsed'
    );
    expect(screen.queryByText('Website')).toBeNull();
  });

  it('says when a shown block has nothing to show yet', () => {
    renderBlock({ ...LINKS, status: 'empty', items: [] });
    expect(screen.getByText('Nothing to show yet')).toBeInTheDocument();
  });

  it('offers Retry when its source failed', async () => {
    const onRetry = vi.fn();
    renderBlock(
      { ...LINKS, status: 'error', items: [], failedSources: ['sifa'] },
      onRetry
    );
    expect(screen.getByText("Couldn't load Sifa")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('its own content replaces the items, even when there are none yet', () => {
    renderBlock({ ...LINKS, status: 'empty', items: [] }, vi.fn(), {
      content: <button type="button">Add a link</button>,
    });
    expect(
      screen.getByRole('button', { name: 'Add a link' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Nothing to show yet')).toBeNull();
  });

  it('puts its footer after the items', () => {
    renderBlock(LINKS, vi.fn(), { footer: <p>ORCID helper</p> });
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('ORCID helper')).toBeInTheDocument();
  });

  it('a hidden block shows neither', () => {
    renderBlock({ ...LINKS, visible: false }, vi.fn(), {
      content: <p>Editor</p>,
      footer: <p>ORCID helper</p>,
    });
    expect(screen.queryByText('Editor')).toBeNull();
    expect(screen.queryByText('ORCID helper')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderBlock(LINKS);
    await expectNoAxeViolations(container);
  });
});
