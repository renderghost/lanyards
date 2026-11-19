import { useLingui } from '@lingui/react/macro';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { IconButton } from '@/components/IconButton/IconButton';
import { Switch } from '@/components/Switch/Switch';
import { BLOCK_HEADINGS } from '@/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants';
import { COUNTED_BLOCKS, DEFAULT_ITEM_LIMIT } from '@/lib/person/config';
import { cn } from '@/lib/utils';

import { LIMIT_OPTIONS } from './BlockBar.constants';
import * as styles from './BlockBar.styles';
import type { BlockBarProps } from './BlockBar.types';

/**
 * The control bar above each block on the lanyard (#118, option A): a
 * drag handle, Move up and Move down, a count for feeds, and a switch that
 * shows the block to visitors or hides it.
 */
export function BlockBar({
  type,
  index,
  total,
  visible,
  limit,
  disabled,
  onMove,
  onVisibleChange,
  onLimitChange,
  dragHandle,
}: BlockBarProps) {
  const { t, i18n } = useLingui();
  const name = i18n._(BLOCK_HEADINGS[type]);
  const upRef = useRef<HTMLButtonElement>(null);
  const downRef = useRef<HTMLButtonElement>(null);
  // The Move button just pressed, so focus stays on it as the block moves
  // (React may re-insert the block, which would drop focus).
  const pressed = useRef<'up' | 'down' | null>(null);
  const atTop = index === 0;
  const atBottom = index === total - 1;

  useEffect(() => {
    if (!pressed.current) return;
    (pressed.current === 'up' ? upRef : downRef).current?.focus();
    pressed.current = null;
  }, [index]);

  return (
    <div className={cn(styles.bar, !visible && styles.barHidden)}>
      <button
        type="button"
        ref={dragHandle?.ref}
        {...dragHandle?.attributes}
        {...dragHandle?.listeners}
        aria-label={t`Reorder ${name}`}
        disabled={disabled}
        className={styles.handle}
      >
        <GripVertical aria-hidden="true" className={styles.icon} />
      </button>
      <div className={styles.label}>
        <span className={styles.name}>{name}</span>
        {!visible && (
          <span className={styles.hiddenLabel}>{t`Hidden from visitors`}</span>
        )}
      </div>
      <div className={styles.controls}>
        {COUNTED_BLOCKS.has(type) && onLimitChange && (
          <label className={styles.limit}>
            <span>{t`Show`}</span>
            <select
              aria-label={t`Items to show for ${name}`}
              value={limit ?? DEFAULT_ITEM_LIMIT}
              disabled={disabled}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className={styles.select}
            >
              {LIMIT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
        {/* At the ends the buttons stay focusable, so pressing one again
            does nothing rather than dropping focus to the page. */}
        <IconButton
          ref={upRef}
          label={t`Move ${name} up`}
          icon={<ArrowUp />}
          aria-disabled={atTop || undefined}
          disabled={disabled}
          onClick={() => {
            if (atTop) return;
            pressed.current = 'up';
            onMove(index - 1);
          }}
        />
        <IconButton
          ref={downRef}
          label={t`Move ${name} down`}
          icon={<ArrowDown />}
          aria-disabled={atBottom || undefined}
          disabled={disabled}
          onClick={() => {
            if (atBottom) return;
            pressed.current = 'down';
            onMove(index + 1);
          }}
        />
        <span className={styles.switchWrap}>
          <Switch
            checked={visible}
            onCheckedChange={onVisibleChange}
            label={t`Show ${name}`}
            disabled={disabled}
          />
        </span>
      </div>
    </div>
  );
}
