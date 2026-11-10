import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLingui } from '@lingui/react/macro';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { Switch } from 'radix-ui';
import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { SOURCE_LABELS } from '@/features/lanyard/components/BlockSection/BlockSection.constants';
import { itemLimit } from '@/lib/person/config';
import { cn } from '@/lib/utils';

import { LIMIT_OPTIONS } from './BlockEditorRow.constants';
import * as styles from './BlockEditorRow.styles';
import type { BlockEditorRowProps } from './BlockEditorRow.types';

/**
 * One block in the block editor: drag handle, Move up and Move down, a
 * visibility switch, the item limit and, for visible blocks, whether it
 * has anything to show.
 */
export function BlockEditorRow({
  block,
  name,
  index,
  total,
  status,
  editLinks,
  disabled,
  onMove,
  onToggle,
  onLimit,
  onRetry,
  className,
}: BlockEditorRowProps) {
  const { t, i18n } = useLingui();
  const nameId = useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.type, disabled });
  const failed =
    status?.status === 'error'
      ? status.sources.map((source) => i18n._(SOURCE_LABELS[source])).join(', ')
      : '';

  return (
    <li
      ref={setNodeRef}
      // The one inline style: dnd-kit moves the row with a per-frame
      // transform while it is dragged, which classes can't express.
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      data-block={block.type}
      aria-labelledby={nameId}
      className={cn(styles.row, isDragging && styles.dragging, className)}
    >
      <div className={styles.top}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t`Reorder ${name}`}
          disabled={disabled}
          className={styles.handle}
        >
          <GripVertical aria-hidden="true" className={styles.icon} />
        </button>
        <span id={nameId} className={styles.name}>
          {name}
        </span>
        <Switch.Root
          checked={block.visible}
          onCheckedChange={onToggle}
          disabled={disabled}
          aria-label={t`Show ${name}`}
          className={styles.switchRoot}
        >
          <Switch.Thumb className={styles.switchThumb} />
        </Switch.Root>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          aria-label={t`Move up`}
          disabled={disabled || index === 0}
          onClick={() => onMove(index - 1)}
          className={styles.move}
        >
          <ArrowUp aria-hidden="true" className={styles.icon} />
        </button>
        <button
          type="button"
          aria-label={t`Move down`}
          disabled={disabled || index === total - 1}
          onClick={() => onMove(index + 1)}
          className={styles.move}
        >
          <ArrowDown aria-hidden="true" className={styles.icon} />
        </button>
        <label className={styles.limit}>
          <span>{t`Items to show`}</span>
          <select
            value={itemLimit(block)}
            disabled={disabled}
            onChange={(event) => onLimit(Number(event.target.value))}
            className={styles.select}
          >
            {LIMIT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      {block.visible && status && status.status !== 'ready' && (
        <div className={styles.status}>
          {status.status === 'loading' && (
            <p className={styles.statusText}>{t`Loading…`}</p>
          )}
          {status.status === 'empty' && (
            <>
              <p className={styles.statusText}>{t`Nothing to show yet`}</p>
              {editLinks.map((link) => (
                <ExternalLink
                  key={link.url}
                  href={link.url}
                  className={styles.editLink}
                >
                  {link.label}
                </ExternalLink>
              ))}
            </>
          )}
          {status.status === 'error' && (
            <>
              <p className={styles.statusText}>{t`Couldn't load ${failed}`}</p>
              <Button variant="secondary" onClick={onRetry}>
                {t`Retry`}
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
