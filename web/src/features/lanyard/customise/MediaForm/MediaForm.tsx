import { useLingui } from '@lingui/react/macro';
import { type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { SelectField } from '@/components/SelectField/SelectField';
import { TextAreaField } from '@/components/TextAreaField/TextAreaField';
import { TextField } from '@/components/TextField/TextField';
import { notify } from '@/components/Toaster/notify';
import {
  PLATFORM_LABELS,
  TYPE_LABELS,
} from '@/features/lanyard/components/blocks/MediaBlock/MediaBlock.constants';
import { track } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import { useKeptRecordWriter } from '../../hooks/useKeptRecords';
import {
  EMPTY_MEDIA,
  MEDIA,
  MEDIA_KINDS,
  type MediaKind,
} from './MediaForm.constants';
import * as styles from './MediaForm.styles';
import type {
  MediaErrors,
  MediaFormProps,
  MediaValues,
} from './MediaForm.types';
import { validateMedia } from './MediaForm.validation';

/** Adds a kept podcast (audio) or video to the lanyard. */
export function MediaForm({ disabled = false, className }: MediaFormProps) {
  const { t, i18n } = useLingui();
  const writer = useKeptRecordWriter();
  const [kind, setKind] = useState<MediaKind>('audio');
  const [values, setValues] = useState<MediaValues>(EMPTY_MEDIA);
  const [errors, setErrors] = useState<MediaErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const platformRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const kindLabels: Record<MediaKind, string> = {
    audio: t`Audio`,
    video: t`Video`,
  };
  const messages = {
    url: {
      required: t`Enter a web address`,
      scheme: t`Enter a web address starting with https:// or http://`,
    },
    platform: { required: t`Choose a platform` },
    title: { tooLong: t`Keep the title to 200 characters or fewer` },
    description: {
      tooLong: t`Keep the description to 1,000 characters or fewer`,
    },
  };
  const options = (list: string[], labels: typeof PLATFORM_LABELS) =>
    list.map((value) => ({
      value,
      label: labels[value] ? i18n._(labels[value]) : value,
    }));

  const change = (field: keyof MediaValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));
  const check = (field: keyof MediaErrors) => () =>
    setErrors((current) => ({
      ...current,
      [field]: validateMedia(values)[field],
    }));

  function chooseKind(next: MediaKind) {
    setKind(next);
    // Platforms and content types differ by kind, so they start again.
    setValues((current) => ({ ...current, platform: '', type: '' }));
    setErrors((current) => ({ ...current, platform: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateMedia(values);
    setErrors(found);
    if (found.url) return urlRef.current?.focus();
    if (found.platform) return platformRef.current?.focus();
    if (found.title) return titleRef.current?.focus();
    if (found.description) return descriptionRef.current?.focus();

    setSubmitting(true);
    try {
      const title = values.title.trim();
      const description = values.description.trim();
      await writer.create(MEDIA[kind].collection, {
        url: values.url.trim(),
        platform: values.platform,
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(values.type ? { type: values.type } : {}),
        createdAt: new Date().toISOString(),
      });
      setValues(EMPTY_MEDIA);
      notify.success(kind === 'audio' ? t`Audio added` : t`Video added`);
      track('kept_record_saved', { kind });
    } catch {
      notify.error(t`Failed to save. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={submit} className={cn(styles.form, className)}>
      <fieldset disabled={disabled} className={styles.fieldset}>
        <legend className={styles.legend}>{t`Type of media`}</legend>
        <div className={styles.kinds}>
          {MEDIA_KINDS.map((option) => (
            <label key={option} className={styles.kind}>
              <input
                type="radio"
                name="mediaKind"
                value={option}
                checked={kind === option}
                onChange={() => chooseKind(option)}
                className={styles.radio}
              />
              <span>{kindLabels[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <TextField
        ref={urlRef}
        label={t`Web address`}
        name="url"
        type="url"
        inputMode="url"
        required
        value={values.url}
        onChange={(event) => change('url')(event.target.value)}
        onBlur={check('url')}
        error={errors.url && messages.url[errors.url]}
        disabled={disabled}
      />
      <SelectField
        ref={platformRef}
        label={t`Platform`}
        name="platform"
        required
        placeholder={t`Choose a platform`}
        options={options(MEDIA[kind].platforms, PLATFORM_LABELS)}
        value={values.platform}
        onChange={change('platform')}
        onBlur={check('platform')}
        error={errors.platform && messages.platform[errors.platform]}
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
      <TextAreaField
        ref={descriptionRef}
        label={t`Description`}
        name="description"
        value={values.description}
        onChange={(event) => change('description')(event.target.value)}
        onBlur={check('description')}
        error={errors.description && messages.description[errors.description]}
        disabled={disabled}
      />
      <SelectField
        label={t`Kind of content`}
        name="type"
        placeholder={t`Not specified`}
        options={options(MEDIA[kind].types, TYPE_LABELS)}
        value={values.type}
        onChange={change('type')}
        disabled={disabled}
      />
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="secondary"
          loading={submitting}
          disabled={disabled}
        >
          {t`Add media`}
        </Button>
      </div>
    </form>
  );
}
