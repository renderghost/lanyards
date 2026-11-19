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
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
import { DEFAULT_ACCENT } from '@/design/accents';
import { BadgeHero } from '@/features/lanyard/components/BadgeHero/BadgeHero';
import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
import { BLOCK_HEADINGS } from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';
import { LanyardSkeleton } from '@/features/lanyard/components/LanyardSkeleton/LanyardSkeleton';
import { LanyardSurface } from '@/features/lanyard/components/LanyardSurface/LanyardSurface';
import { useApplyAccent } from '@/hooks/useApplyAccent';
import { profileId } from '@/lib/atproto/profileId';
import { BLOCK_SOURCES, hiddenMatcher } from '@/lib/person/blocks';
import { hideProblem, type RenderableBlockType } from '@/lib/person/config';
import { usePersonView } from '@/lib/person/usePersonView';

import { EditableBlock } from '../EditableBlock/EditableBlock';
import { RecordToggle } from '../RecordToggle/RecordToggle';
import * as styles from './LanyardEditor.styles';
import type { LanyardEditorProps } from './LanyardEditor.types';

/**
 * The owner's lanyard, edited where it is (#118): every block with its bar
 * (drag, move, show/hide, count) and every record with its own show/hide.
 * Hidden blocks and records stay in place. Every move is announced.
 */
export function LanyardEditor({
  did,
  config,
  onChange,
  disabled,
}: LanyardEditorProps) {
  const { t, i18n } = useLingui();
  const view = usePersonView(did, { mode: 'owner' });
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
  useApplyAccent(view.configReady ? view.config.accent : DEFAULT_ACCENT);

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

  function setBlock(
    type: RenderableBlockType,
    patch: { visible?: boolean; limit?: number }
  ) {
    onChange((current) => ({
      ...current,
      blocks: current.blocks.map((entry) =>
        entry.type === type ? { ...entry, ...patch } : entry
      ),
    }));
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

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    move(positionOf(active.id) - 1, positionOf(over.id) - 1);
  }

  const itemActions = useMemo<ItemActions>(() => {
    const isHidden = hiddenMatcher(config.hidden);
    return {
      isHidden,
      renderToggle: (itemKey, title) => (
        <RecordToggle
          title={title}
          hidden={isHidden(itemKey)}
          disabled={disabled}
          onToggle={() => {
            if (isHidden(itemKey)) {
              const shown = hiddenMatcher([itemKey]);
              onChange((current) => ({
                ...current,
                hidden: current.hidden.filter((key) => !shown(key)),
              }));
              return;
            }
            const problem = hideProblem(config, itemKey);
            if (problem) {
              notify.error(
                problem === 'tooMany'
                  ? t`You can hide up to 500 items. Show some again first.`
                  : t`This item can't be hidden.`
              );
              return;
            }
            onChange((current) => ({
              ...current,
              hidden: [...current.hidden, itemKey],
            }));
          }}
        />
      ),
    };
  }, [config, disabled, onChange, t]);

  if (!view.hero) {
    return (
      <LanyardSurface variant="card">
        <LanyardSkeleton />
      </LanyardSurface>
    );
  }

  const profile = profileId(did, view.hero.handle);
  const orphans = view.orphanedHidden;
  const count = orphans.length;

  return (
    <LanyardSurface variant="card">
      <div className={styles.page}>
        <BadgeHero hero={view.hero} headingLevel={2} />
        {view.configError && (
          <div role="status" className={styles.notice}>
            <p className={styles.noticeText}>
              {t`Couldn't load your lanyard settings`}
            </p>
            <Button variant="secondary" onClick={() => view.retry('lanyards')}>
              {t`Retry`}
            </Button>
          </div>
        )}
        <p aria-live="polite" className={styles.announcer}>
          {announcement}
        </p>
        <ItemActionsContext value={itemActions}>
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
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              <ul aria-label={t`Blocks`} className={styles.list}>
                {view.editorBlocks.map((block, index) => (
                  <EditableBlock
                    key={block.type}
                    block={block}
                    index={index}
                    total={total}
                    profile={profile}
                    disabled={disabled}
                    onMove={(to) => {
                      move(index, to);
                      setAnnouncement(moved(block.type, to));
                    }}
                    onVisibleChange={(visible) =>
                      setBlock(block.type, { visible })
                    }
                    onLimitChange={(limit) => setBlock(block.type, { limit })}
                    onRetry={() =>
                      Promise.allSettled(
                        BLOCK_SOURCES[block.type].map(view.retry)
                      )
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </ItemActionsContext>
        {count > 0 && (
          <div className={styles.notice}>
            <p className={styles.noticeText}>
              {plural(count, {
                one: '# hidden item is no longer on your lanyard',
                other: '# hidden items are no longer on your lanyard',
              })}
            </p>
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => {
                const gone = new Set(orphans);
                onChange((current) => ({
                  ...current,
                  hidden: current.hidden.filter((key) => !gone.has(key)),
                }));
              }}
            >
              {t`Clear`}
            </Button>
          </div>
        )}
      </div>
    </LanyardSurface>
  );
}
