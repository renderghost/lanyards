import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';

import { Button } from '@/components/Button/Button';
import { captureError } from '@/lib/analytics/analytics';

import * as styles from './AppError.styles';
import type { AppErrorProps } from './AppError.types';

export function AppError({ error }: AppErrorProps) {
  const { t } = useLingui();

  useEffect(() => {
    captureError(error, { source: 'route' });
  }, [error]);

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>{t`Something went wrong`}</h1>
      <Button onClick={() => window.location.reload()}>{t`Reload`}</Button>
    </section>
  );
}
