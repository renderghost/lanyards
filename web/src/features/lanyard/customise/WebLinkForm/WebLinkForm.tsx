import { useLingui } from '@lingui/react/macro';
import { type FocusEvent, type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { TextField } from '@/components/TextField/TextField';
import { notify } from '@/components/Toaster/notify';
import { track } from '@/lib/analytics/analytics';
import { leavingForSubmit } from '@/lib/forms';
import { LANYARDS_NSID } from '@/lib/lexicons/nsids';
import { cn } from '@/lib/utils';

import { useKeptRecordWriter } from '../../hooks/useKeptRecords';
import { EMPTY_WEB_LINK } from './WebLinkForm.constants';
import * as styles from './WebLinkForm.styles';
import type {
  WebLinkErrors,
  WebLinkFormProps,
  WebLinkValues,
} from './WebLinkForm.types';
import { validateWebLink } from './WebLinkForm.validation';

/** Adds a kept web link (app.lanyards.link.web) to the lanyard. */
export function WebLinkForm({ disabled = false, className }: WebLinkFormProps) {
  const { t } = useLingui();
  const writer = useKeptRecordWriter();
  const [values, setValues] = useState<WebLinkValues>(EMPTY_WEB_LINK);
  const [errors, setErrors] = useState<WebLinkErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const messages = {
    url: {
      required: t`Enter a web address`,
      scheme: t`Enter a web address starting with https:// or http://`,
    },
    title: { tooLong: t`Keep the title to 100 characters or fewer` },
  };

  const change = (field: keyof WebLinkValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));
  const check =
    (field: keyof WebLinkValues) => (event: FocusEvent<Element>) => {
      if (leavingForSubmit(event)) return;
      setErrors((current) => ({
        ...current,
        [field]: validateWebLink(values)[field],
      }));
    };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateWebLink(values);
    setErrors(found);
    if (found.url) return urlRef.current?.focus();
    if (found.title) return titleRef.current?.focus();

    setSubmitting(true);
    try {
      const title = values.title.trim();
      await writer.create(LANYARDS_NSID.webLink, {
        url: values.url.trim(),
        ...(title ? { title } : {}),
        createdAt: new Date().toISOString(),
      });
      setValues(EMPTY_WEB_LINK);
      notify.success(t`Link added`);
      track('kept_record_saved', { kind: 'webLink' });
    } catch {
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={submit} className={cn(styles.form, className)}>
      <TextField
        ref={urlRef}
        label={t`Web address`}
        name="url"
        type="url"
        inputMode="url"
        autoComplete="url"
        required
        value={values.url}
        onChange={(event) => change('url')(event.target.value)}
        onBlur={check('url')}
        error={errors.url && messages.url[errors.url]}
        disabled={disabled}
      />
      <TextField
        ref={titleRef}
        label={t`Title`}
        name="title"
        value={values.title}
        onChange={(event) => change('title')(event.target.value)}
        onBlur={check('title')}
        error={errors.title && messages.title[errors.title]}
        disabled={disabled}
      />
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="secondary"
          loading={submitting}
          disabled={disabled}
        >
          {t`Add link`}
        </Button>
      </div>
    </form>
  );
}
