import { useLingui } from '@lingui/react/macro';
import { lazy, Suspense } from 'react';

import { Button } from '@/components/Button/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

import { LanyardNotice } from '../LanyardNotice/LanyardNotice';
import { LanyardSkeleton } from '../LanyardSkeleton/LanyardSkeleton';
import * as styles from './LanyardProblem.styles';
import type { LanyardProblemProps } from './LanyardProblem.types';

// Only missing lanyards need the search, so its combobox stays out of the
// lanyard route's initial JavaScript.
const LanyardNotFound = lazy(() =>
  import('../LanyardNotFound/LanyardNotFound').then((module) => ({
    default: module.LanyardNotFound,
  }))
);

/** Why a lanyard can't be shown: missing, unavailable, or Bluesky is down. */
export function LanyardProblem({
  error,
  handle,
  onRetry,
}: LanyardProblemProps) {
  const { t } = useLingui();
  const unavailable = error.kind === 'unavailable';
  // Matches LanyardNotFound's own title, which runs first as a child.
  useDocumentTitle(
    error.kind === 'notFound'
      ? t`Not found`
      : unavailable
        ? t`Account unavailable`
        : t`Lanyard unavailable`
  );

  if (error.kind === 'notFound') {
    return (
      <Suspense fallback={<LanyardSkeleton />}>
        <LanyardNotFound handle={handle} />
      </Suspense>
    );
  }
  if (unavailable) {
    return <LanyardNotice heading={t`This account isn't available`} />;
  }
  return (
    <LanyardNotice heading={t`We couldn't load this lanyard`}>
      <p className={styles.text}>
        {t`Bluesky isn't answering right now. Check your connection and try again.`}
      </p>
      <Button onClick={onRetry}>{t`Try again`}</Button>
    </LanyardNotice>
  );
}
