import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
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
  className,
}: WebLinkListProps) {
  const { t } = useLingui();
  const writer = useKeptRecordWriter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const shown = links.filter((link) => !deleted.has(link.key));
  if (shown.length === 0) return null;

  async function remove(link: WebLink) {
    setDeleting(link.key);
    try {
      await writer.remove(LANYARDS_NSID.webLink, rkeyOf(link.key));
      setDeleted((current) => new Set(current).add(link.key));
      notify.success(t`Link deleted`);
    } catch {
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setDeleting(null);
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
