import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { hostOf } from '@/lib/normalise';
import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';
import { cn } from '@/lib/utils';

import { rkeyOf, useKeptRecordWriter } from '../../hooks/useKeptRecords';
import * as styles from './MediaList.styles';
import type { MediaListProps } from './MediaList.types';

/** The owner's kept podcasts and videos, each with Delete. */
export function MediaList({
  items,
  disabled = false,
  onEmptied,
  className,
}: MediaListProps) {
  const { t } = useLingui();
  const writer = useKeptRecordWriter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const shown = items.filter((item) => !deleted.has(item.key));
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  /** Where the item just deleted sat, to focus its neighbour. */
  const deletedAt = useRef<number | null>(null);

  // Deleting removes the focused button: move focus to the next item, the
  // previous one, or (once the list is empty) wherever the page says.
  useEffect(() => {
    if (deletedAt.current === null) return;
    const at = deletedAt.current;
    deletedAt.current = null;
    const next = shown[at] ?? shown[at - 1];
    if (next) buttons.current.get(next.key)?.focus();
    else onEmptied?.();
  }, [shown, onEmptied]);

  if (shown.length === 0) return null;

  async function remove(item: MediaLink) {
    setDeleting(item.key);
    try {
      await writer.remove(LANYARDS_NSID[item.kind], rkeyOf(item.key));
      deletedAt.current = shown.indexOf(item);
      setDeleted((current) => new Set(current).add(item.key));
      notify.success(
        item.kind === 'audio' ? t`Audio deleted` : t`Video deleted`
      );
    } catch {
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <ul className={cn(styles.list, className)}>
      {shown.map((item) => {
        const name = item.title ?? hostOf(item.url);
        return (
          <li key={item.key} className={styles.item}>
            <div className={styles.text}>
              <span className={styles.name}>{name}</span>
              <span className={styles.url}>{item.url}</span>
            </div>
            <Button
              ref={(button) => {
                if (button) buttons.current.set(item.key, button);
                else buttons.current.delete(item.key);
              }}
              variant="ghost"
              aria-label={t`Delete ${name}`}
              loading={deleting === item.key}
              disabled={disabled}
              onClick={() => void remove(item)}
            >
              {t`Delete`}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
