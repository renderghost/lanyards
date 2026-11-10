import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLingui } from '@lingui/react/macro';
import { useId, useRef, useState } from 'react';

import { BLOCK_HEADINGS } from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';
import type { RenderableBlockType } from '@/lib/person/config';
import { EDIT_LINKS } from '@/lib/person/editLinks';
import { cn } from '@/lib/utils';

import { BlockEditorRow } from '../BlockEditorRow/BlockEditorRow';
import * as styles from './BlockEditor.styles';
import type { BlockEditorProps } from './BlockEditor.types';

/**
 * Orders, shows and limits the lanyard's blocks (spec §7.4). Blocks move
 * by drag (pointer or keyboard: Space, arrows, Space) or by Move up and
 * Move down, and every move is announced.
 */
export function BlockEditor({
  config,
  statuses,
  handle,
  disabled = false,
  onChange,
  onRetry,
  className,
}: BlockEditorProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const [announcement, setAnnouncement] = useState('');
  // Where the dragged block was last announced, so the pickup isn't
  // drowned out by "over its own position", and repeats stay quiet.
  const lastOver = useRef<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const order = config.blocks.map((block) => block.type);
  const total = order.length;
  const nameOf = (type: RenderableBlockType) => i18n._(BLOCK_HEADINGS[type]);
  const positionOf = (id: UniqueIdentifier | undefined) =>
    order.indexOf(id as RenderableBlockType) + 1;

  const moved = (type: RenderableBlockType, to: number) => {
    const name = nameOf(type);
    const position = to + 1;
    return t`${name} moved to position ${position} of ${total}`;
  };

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= total) return;
    onChange((current) => ({
      ...current,
      blocks: arrayMove(current.blocks, from, to),
    }));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    move(positionOf(active.id) - 1, positionOf(over.id) - 1);
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      lastOver.current = active.id;
      const name = nameOf(active.id as RenderableBlockType);
      const position = positionOf(active.id);
      return t`Picked up ${name}, at position ${position} of ${total}.`;
    },
    onDragOver: ({ active, over }) => {
      if (!over || over.id === lastOver.current) return undefined;
      lastOver.current = over.id;
      const name = nameOf(active.id as RenderableBlockType);
      const position = positionOf(over.id);
      return t`${name} is over position ${position} of ${total}.`;
    },
    onDragEnd: ({ active, over }) =>
      over
        ? moved(active.id as RenderableBlockType, positionOf(over.id) - 1)
        : undefined,
    onDragCancel: ({ active }) => {
      const name = nameOf(active.id as RenderableBlockType);
      return t`Reordering cancelled. ${name} stayed where it was.`;
    },
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(styles.section, className)}
    >
      <h2 id={headingId} className={styles.heading}>
        {t`Blocks`}
      </h2>
      <p className={styles.hint}>
        {t`Choose which blocks your lanyard shows, in what order, and how many items each shows.`}
      </p>
      <p aria-live="polite" className={styles.announcer}>
        {announcement}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: t`To move a block, press Space or Enter to pick it up, use the arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel.`,
          },
        }}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className={styles.list}>
            {config.blocks.map((block, index) => (
              <BlockEditorRow
                key={block.type}
                block={block}
                name={nameOf(block.type)}
                index={index}
                total={total}
                status={statuses[block.type]}
                editLinks={EDIT_LINKS[block.type](handle).map((link) => ({
                  label: i18n._(link.label),
                  url: link.url,
                }))}
                disabled={disabled}
                onMove={(to) => {
                  move(index, to);
                  setAnnouncement(moved(block.type, to));
                }}
                onToggle={(visible) =>
                  onChange((current) => ({
                    ...current,
                    blocks: current.blocks.map((entry) =>
                      entry.type === block.type ? { ...entry, visible } : entry
                    ),
                  }))
                }
                onLimit={(limit) =>
                  onChange((current) => ({
                    ...current,
                    blocks: current.blocks.map((entry) =>
                      entry.type === block.type ? { ...entry, limit } : entry
                    ),
                  }))
                }
                onRetry={() => onRetry(block.type)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
