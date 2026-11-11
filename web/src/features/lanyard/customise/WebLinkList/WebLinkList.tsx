import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
import { captureError } from '@/lib/analytics/analytics';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { hostOf } from '@/lib/normalise';
import type { WebLink } from '@/lib/sources/lanyards/lanyards.types';
import { cn } from '@/lib/utils';

import { rkeyOf, useKeptRecordWriter } from '../../hooks/useKeptRecords';
import * as styles from './WebLinkList.styles';
import type { WebLinkListProps } from './WebLinkList.types';

/** The owner's kept web links, each with Delete. */
export function WebLinkList({
  links,
  disabled = false,
  onEmptied,
  className,
}: WebLinkListProps) {
  const { t } = useLingui();
  const writer = useKeptRecordWriter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const shown = links.filter((link) => !deleted.has(link.key));
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

  async function remove(link: WebLink) {
    setDeleting(link.key);
    try {
      const removed = await writer.remove(
        LANYARDS_NSID.webLink,
        rkeyOf(link.key)
      );
      deletedAt.current = shown.indexOf(link);
      setDeleted((current) => new Set(current).add(link.key));
      if (removed) {
        notify.success(t`Link deleted`, {
          action: { label: t`Undo`, onClick: () => void undo(link, removed) },
        });
      } else {
        notify.success(t`Link deleted`);
      }
    } catch (cause) {
      captureError(cause, { source: 'web-link' });
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setDeleting(null);
    }
  }

  async function undo(link: WebLink, removed: Record<string, unknown>) {
    try {
      await writer.restore(LANYARDS_NSID.webLink, rkeyOf(link.key), removed);
      setDeleted((current) => {
        const next = new Set(current);
        next.delete(link.key);
        return next;
      });
      notify.success(t`Link restored`);
    } catch (cause) {
      captureError(cause, { source: 'web-link' });
      notify.error(t`Couldn't restore the link. Please try again.`);
    }
  }

  return (
    <ul className={cn(styles.list, className)}>
      {shown.map((link) => {
        const name = link.title ?? hostOf(link.url);
        return (
          <li key={link.key} className={styles.item}>
            <div className={styles.text}>
              <span className={styles.name}>{name}</span>
              <span className={styles.url}>{link.url}</span>
            </div>
            <Button
              ref={(button) => {
                if (button) buttons.current.set(link.key, button);
                else buttons.current.delete(link.key);
              }}
              variant="ghost"
              aria-label={t`Delete ${name}`}
              loading={deleting === link.key}
              disabled={disabled}
              onClick={() => void remove(link)}
            >
              {t`Delete`}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
