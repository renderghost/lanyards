import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { recallReturnTo } from '@/lib/atproto/session';

import { ERROR_COPY } from './CallbackStatus.constants';
import * as styles from './CallbackStatus.styles';
import type { CallbackStatusProps } from './CallbackStatus.types';

/** Keeps the page sign-in started from, so trying again returns there. */
function tryAgainSearch(): { returnTo?: string } {
  const returnTo = recallReturnTo();
  return returnTo === '/' ? {} : { returnTo };
}

export function CallbackStatus({ status }: CallbackStatusProps) {
  const { t } = useLingui();

  if (status === 'working') {
    return (
      <section className={styles.page}>
        <h1 className={styles.heading}>{t`Sign in`}</h1>
        <p role="status" aria-live="polite" className={styles.message}>
          {t`Signing you in…`}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>{t`Sign in`}</h1>
      <p role="alert" className={styles.message}>
        {t(ERROR_COPY[status])}
      </p>
      <Link to="/" search={tryAgainSearch()} className={styles.link}>
        {t`Try again`}
      </Link>
    </section>
  );
}
