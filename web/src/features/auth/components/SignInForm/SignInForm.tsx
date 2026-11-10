import { useLingui } from '@lingui/react/macro';
import { type FormEvent, useCallback, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { HandleCombobox } from '@/components/HandleCombobox/HandleCombobox';
import { notify } from '@/components/Toaster/notify';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { captureError, track } from '@/lib/analytics/analytics';
import {
  isUnknownAccountError,
  startSignIn,
  startSignUp,
} from '@/lib/atproto/session';

import { ERROR_MESSAGES, FIELD_ID } from './SignInForm.constants';
import * as styles from './SignInForm.styles';
import type { SignInFormProps } from './SignInForm.types';
import {
  normaliseIdentifier,
  type SignInError,
  validateIdentifier,
} from './SignInForm.validation';

export function SignInForm({ returnTo }: SignInFormProps) {
  const { t } = useLingui();
  const online = useOnlineStatus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<SignInError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onLookupError = useCallback((lookupError: unknown) => {
    captureError(lookupError, { source: 'typeahead' });
  }, []);

  const handleChange = (next: string) => {
    setValue(next);
    // Once an error is showing, keep it in step with what the user types.
    if (error) setError(validateIdentifier(next));
  };

  const handleBlur = () => {
    if (value.trim()) setError(validateIdentifier(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validateIdentifier(value);
    setError(problem);
    if (problem) {
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      // On success the browser leaves for the sign-in page.
      await startSignIn(normaliseIdentifier(value), returnTo);
    } catch (startError) {
      setSubmitting(false);
      if (isUnknownAccountError(startError)) {
        // Usually a typo: say so where the user is looking.
        track('sign_in_failed', { reason: 'unknown-account' });
        setError('notFound');
        inputRef.current?.focus();
        return;
      }
      track('sign_in_failed', { reason: 'start' });
      captureError(startError, { source: 'sign-in' });
      notify.error(t`Couldn't start sign-in. Please try again.`);
    }
  };

  const handleSignUp = async () => {
    setSubmitting(true);
    try {
      await startSignUp(returnTo);
    } catch (startError) {
      setSubmitting(false);
      captureError(startError, { source: 'sign-up' });
      notify.error(t`Couldn't start creating an account. Please try again.`);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <HandleCombobox
        id={FIELD_ID}
        label={t`Your handle`}
        hint={t`For example alice.bsky.social`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onLookupError={onLookupError}
        error={error ? t(ERROR_MESSAGES[error]) : undefined}
        required
        inputRef={inputRef}
      />
      {!online && (
        <p role="status" className={styles.offline}>
          {t`You're offline. Connect to sign in.`}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="submit" size="lg" loading={submitting} disabled={!online}>
          {t`Sign in`}
        </Button>
        <Button
          variant="secondary"
          disabled={!online || submitting}
          onClick={handleSignUp}
        >
          {t`Create an account`}
        </Button>
      </div>
    </form>
  );
}
