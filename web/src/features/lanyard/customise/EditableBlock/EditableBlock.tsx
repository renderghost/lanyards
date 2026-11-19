import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLingui } from '@lingui/react/macro';

import { BlockSection } from '@/features/lanyard/components/BlockSection/BlockSection';
import {
  BLOCK_COMPONENTS,
  BLOCK_HEADINGS,
} from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';
import { captureError } from '@/lib/analytics/analytics';
import { COUNTED_BLOCKS } from '@/lib/person/config';
import { EDIT_LINKS } from '@/lib/person/editLinks';
import { cn } from '@/lib/utils';

import { BlockControls } from '../BlockControls/BlockControls';
import { BlockHandle } from '../BlockHandle/BlockHandle';
import * as styles from './EditableBlock.styles';
import type { EditableBlockProps } from './EditableBlock.types';

/**
 * One block as the owner edits it on the lanyard: framed, with its handle,
 * name and controls in one header row, then (while shown to visitors)
 * every item, hidden ones in place. A hidden block collapses to its header
 * row (#122).
 */
export function EditableBlock({
  block,
  index,
  total,
  profile,
  disabled,
  onMove,
  onVisibleChange,
  onLimitChange,
  onRetry,
  content,
  footer,
}: EditableBlockProps) {
  const { t, i18n } = useLingui();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.type, disabled });
  const Items = BLOCK_COMPONENTS[block.type];
  const heading = i18n._(BLOCK_HEADINGS[block.type]);

  return (
    <li
      ref={setNodeRef}
      // The one inline style: dnd-kit moves the block with a per-frame
      // transform while it is dragged, which classes can't express.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-block={block.type}
      aria-label={heading}
      className={cn(styles.block, isDragging && styles.dragging)}
    >
      <BlockSection
        heading={heading}
        status={block.status === 'empty' ? 'ready' : block.status}
        failedSources={block.failedSources}
        owner
        editLinks={EDIT_LINKS[block.type](profile).map((link) => ({
          label: i18n._(link.label),
          url: link.url,
        }))}
        handle={
          <BlockHandle
            type={block.type}
            disabled={disabled}
            dragHandle={{ ref: setActivatorNodeRef, attributes, listeners }}
          />
        }
        note={block.visible ? undefined : t`Hidden from visitors`}
        controls={
          <BlockControls
            type={block.type}
            index={index}
            total={total}
            visible={block.visible}
            limit={block.limit}
            disabled={disabled}
            onMove={onMove}
            onVisibleChange={onVisibleChange}
            onLimitChange={
              COUNTED_BLOCKS.has(block.type) ? onLimitChange : undefined
            }
          />
        }
        collapsed={!block.visible}
        onRetry={onRetry}
        onCrash={(error) =>
          captureError(error, { source: `block:${block.type}` })
        }
      >
        {content ??
          (block.status === 'empty' ? (
            <p className={styles.empty}>{t`Nothing to show yet`}</p>
          ) : (
            <Items items={block.items.map(({ item }) => item) as never[]} />
          ))}
      </BlockSection>
      {block.visible && footer}
    </li>
  );
}
