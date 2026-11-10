import { useId } from 'react';

import { cn } from '@/lib/utils';

import * as styles from './TextAreaField.styles';
import type { TextAreaFieldProps } from './TextAreaField.types';

/** A labelled text area with hint and inline error, like TextField. */
export function TextAreaField({
  label,
  name,
  hint,
  error,
  id,
  required,
  className,
  ref,
  ...rest
}: TextAreaFieldProps) {
  const generatedId = useId();
  const areaId = id ?? generatedId;
  const hintId = `${areaId}-hint`;
  const errorId = `${areaId}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={areaId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={areaId}
        name={name}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          styles.textarea,
          error && styles.textareaInvalid,
          className
        )}
        {...rest}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
