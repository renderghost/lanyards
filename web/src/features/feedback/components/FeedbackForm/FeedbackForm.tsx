import { useLingui } from '@lingui/react/macro';
import { type FormEvent, useId, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { SelectField } from '@/components/SelectField/SelectField';
import { TextAreaField } from '@/components/TextAreaField/TextAreaField';
import { TextField } from '@/components/TextField/TextField';
import { notify } from '@/components/Toaster/notify';
import {
  MissingPermissionError,
  ScopeRefusedError,
} from '@/lib/atproto/writes';
import { cn } from '@/lib/utils';

import { techDetails } from '../../techDetails';
import { useSendFeedback } from '../../useSendFeedback';
import { ScreenshotPicker } from '../ScreenshotPicker/ScreenshotPicker';
import { EMPTY_FEEDBACK, RADIO_MAX } from './FeedbackForm.constants';
import * as styles from './FeedbackForm.styles';
import type {
  FeedbackErrors,
  FeedbackFormProps,
  FeedbackValues,
} from './FeedbackForm.types';
import { validateFeedback } from './FeedbackForm.validation';

/**
 * Feedback to our UserInput board (#134): what it's about (the board's
 * own tags), a title, details, screenshots and, if wanted, technical
 * details shown in full. It says before sending that all of it is public.
 */
export function FeedbackForm({
  board,
  page,
  onSent,
  onNeedsPermission,
  capture,
  className,
}: FeedbackFormProps) {
  const { t } = useLingui();
  const send = useSendFeedback();
  const typeId = useId();
  const [values, setValues] = useState<FeedbackValues>(EMPTY_FEEDBACK);
  const [errors, setErrors] = useState<FeedbackErrors>({});
  const firstType = useRef<HTMLInputElement>(null);
  const typeSelect = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  const tags = board.tags;
  const needsType = tags.length > 0;
  const details = values.techDetails ? techDetails({ page }) : undefined;

  const messages = {
    type: { required: t`Choose what this is about` },
    title: {
      required: t`Give it a title`,
      tooLong: t`Keep the title to 300 characters`,
    },
    details: { tooLong: t`Keep the details to 10,000 characters` },
  };

  const change =
    <K extends keyof FeedbackValues>(key: K) =>
    (value: FeedbackValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      if (key in errors)
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

  // Validate on blur: only the field just left, once it has something.
  const check = (key: 'title' | 'details') => () => {
    const found = validateFeedback(values, { needsType });
    if (key === 'title' && !values.title.trim()) return;
    setErrors((current) => ({ ...current, [key]: found[key] }));
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    if (send.isPending) return;
    const found = validateFeedback(values, { needsType });
    setErrors(found);
    if (found.type) return (firstType.current ?? typeSelect.current)?.focus();
    if (found.title) return titleRef.current?.focus();
    if (found.details) return detailsRef.current?.focus();

    send.mutate(
      {
        type: values.type,
        title: values.title,
        details: values.details,
        screenshots: values.screenshots,
        ...(details ? { techDetails: details } : {}),
      },
      {
        onSuccess: (sent) => {
          notify.success(t`Feedback sent`);
          onSent(sent);
        },
        onError: (error) => {
          if (
            error instanceof MissingPermissionError ||
            error instanceof ScopeRefusedError
          ) {
            onNeedsPermission();
            return;
          }
          notify.error(t`Couldn't send your feedback. Please try again.`);
        },
      }
    );
  }

  const typeError = errors.type && messages.type[errors.type];

  return (
    <form noValidate onSubmit={submit} className={cn(styles.form, className)}>
      {needsType && tags.length <= RADIO_MAX && (
        <fieldset className={styles.fieldset}>
          <legend id={`${typeId}-legend`} className={styles.legend}>
            {t`What is this about?`}
          </legend>
          <div
            role="radiogroup"
            aria-labelledby={`${typeId}-legend`}
            aria-required
            aria-invalid={typeError ? true : undefined}
            aria-describedby={typeError ? `${typeId}-error` : undefined}
            className={styles.types}
          >
            {tags.map((tag, index) => (
              <label key={tag.value} className={styles.type}>
                <input
                  ref={index === 0 ? firstType : undefined}
                  type="radio"
                  name="feedbackType"
                  value={tag.value}
                  checked={values.type === tag.value}
                  onChange={() => change('type')(tag.value)}
                  className={styles.radio}
                />
                <span>{tag.label}</span>
              </label>
            ))}
          </div>
          {typeError && (
            <p id={`${typeId}-error`} role="alert" className={styles.error}>
              {typeError}
            </p>
          )}
        </fieldset>
      )}
      {needsType && tags.length > RADIO_MAX && (
        <SelectField
          ref={typeSelect}
          label={t`What is this about?`}
          name="feedbackType"
          required
          placeholder={t`Choose one`}
          options={tags.map(({ value, label }) => ({ value, label }))}
          value={values.type}
          onChange={change('type')}
          error={typeError}
        />
      )}
      <TextField
        ref={titleRef}
        label={t`Title`}
        name="title"
        required
        value={values.title}
        onChange={(event) => change('title')(event.target.value)}
        onBlur={check('title')}
        error={errors.title && messages.title[errors.title]}
      />
      <TextAreaField
        ref={detailsRef}
        label={t`Details`}
        name="details"
        rows={6}
        hint={t`What happened, and what did you expect? Steps to repeat it help.`}
        value={values.details}
        onChange={(event) => change('details')(event.target.value)}
        onBlur={check('details')}
        error={errors.details && messages.details[errors.details]}
      />
      <ScreenshotPicker
        value={values.screenshots}
        onChange={change('screenshots')}
        capture={capture}
      />
      <div className={styles.details}>
        <label className={styles.tick}>
          <input
            type="checkbox"
            checked={values.techDetails}
            onChange={(event) => change('techDetails')(event.target.checked)}
            className={styles.checkbox}
          />
          <span>{t`Include technical details`}</span>
        </label>
        {details && <pre className={styles.preview}>{details}</pre>}
      </div>
      <p className={styles.notice}>
        {t`Your feedback and screenshots are posted publicly from your account. For anything private, including security issues, message us on Signal.`}
      </p>
      <div className={styles.actions}>
        <Button type="submit" size="lg" loading={send.isPending}>
          {t`Send feedback`}
        </Button>
      </div>
    </form>
  );
}
