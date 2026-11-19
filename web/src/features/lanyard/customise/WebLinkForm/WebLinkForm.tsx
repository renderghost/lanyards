import { useLingui } from '@lingui/react/macro';
import { type FocusEvent, type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { TextField } from '@/components/TextField/TextField';
import { leavingForSubmit } from '@/lib/forms';
import { cn } from '@/lib/utils';

import { EMPTY_WEB_LINK } from './WebLinkForm.constants';
import * as styles from './WebLinkForm.styles';
import type {
  WebLinkErrors,
  WebLinkFormProps,
  WebLinkValues,
} from './WebLinkForm.types';
import { validateWebLink } from './WebLinkForm.validation';

/**
 * A web link for the lanyard: a new one, or `initial` to edit. A valid link
 * goes to `onSubmit`; the form writes nothing itself.
 */
export function WebLinkForm({
  onSubmit,
  initial,
  onCancel,
  disabled = false,
  className,
}: WebLinkFormProps) {
  const { t } = useLingui();
  const [values, setValues] = useState<WebLinkValues>(
    initial ? { url: initial.url, title: initial.title ?? '' } : EMPTY_WEB_LINK
  );
  const [errors, setErrors] = useState<WebLinkErrors>({});
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

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateWebLink(values);
    setErrors(found);
    if (found.url) return urlRef.current?.focus();
    if (found.title) return titleRef.current?.focus();

    const title = values.title.trim();
    onSubmit({ url: values.url.trim(), ...(title ? { title } : {}) });
    if (!initial) setValues(EMPTY_WEB_LINK);
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
        <Button type="submit" variant="secondary" disabled={disabled}>
          {initial ? t`Update link` : t`Add link`}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {t`Cancel`}
          </Button>
        )}
      </div>
    </form>
  );
}
