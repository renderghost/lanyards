import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/utils';

import * as styles from './NotFound.styles';
import type { NotFoundProps } from './NotFound.types';

export function NotFound({ className }: NotFoundProps) {
  const { t } = useLingui();
  return (
    <section className={cn(styles.page, className)}>
      <h1 className={styles.heading}>{t`We couldn't find that page`}</h1>
      <Link to="/" className={styles.link}>
        {t`Go to the home page`}
      </Link>
    </section>
  );
}
