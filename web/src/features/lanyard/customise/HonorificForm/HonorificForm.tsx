import type { Did } from '@atcute/lexicons';
import { useLingui } from '@lingui/react/macro';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { notify } from '@/components/Toaster/notify';
import { captureError, track } from '@/lib/analytics/analytics';
import { getRecord } from '@/lib/atproto/pds';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { cn } from '@/lib/utils';

import { useKeptRecordWriter } from '../../hooks/useKeptRecords';
import {
  type Honorific,
  HONORIFIC_LABELS,
  HONORIFICS,
} from './HonorificForm.constants';
import * as styles from './HonorificForm.styles';
import type { HonorificFormProps } from './HonorificForm.types';
import { isHonorific } from './HonorificForm.validation';

/** When the stored record was created, so a change keeps it. */
async function storedCreatedAt(did: Did): Promise<string | null> {
  const stored = await getRecord(
    'lanyards',
    did,
    LANYARDS_NSID.honorific,
    'self'
  );
  if (!stored.ok) throw stored.error;
  const createdAt = (stored.value?.value as { createdAt?: unknown } | undefined)
    ?.createdAt;
  return typeof createdAt === 'string' ? createdAt : null;
}

/** The kept honorific: None, Dr or Prof (spec §7.4). */
export function HonorificForm({
  current,
  disabled = false,
  className,
}: HonorificFormProps) {
  const { t, i18n } = useLingui();
  const writer = useKeptRecordWriter();
  const [choice, setChoice] = useState<Honorific | null>(null);
  const [saving, setSaving] = useState(false);
  const value = choice ?? current;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!writer.did || !isHonorific(value)) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const createdAt = (await storedCreatedAt(writer.did)) ?? now;
      await writer.put(LANYARDS_NSID.honorific, 'self', {
        value,
        createdAt,
        updatedAt: now,
      });
      notify.success(t`Honorific updated`);
      track('kept_record_saved', { kind: 'honorific' });
    } catch (cause) {
      captureError(cause, { source: 'honorific' });
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className={cn(styles.form, className)}>
      <fieldset disabled={disabled || saving} className={styles.fieldset}>
        <legend className={styles.legend}>{t`Honorific`}</legend>
        <div className={styles.options}>
          {HONORIFICS.map((option) => (
            <label key={option} className={styles.option}>
              <input
                type="radio"
                name="honorific"
                value={option}
                checked={value === option}
                onChange={() => setChoice(option)}
                className={styles.radio}
              />
              <span>{i18n._(HONORIFIC_LABELS[option])}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="secondary"
          loading={saving}
          disabled={disabled}
        >
          {t`Save honorific`}
        </Button>
      </div>
    </form>
  );
}
