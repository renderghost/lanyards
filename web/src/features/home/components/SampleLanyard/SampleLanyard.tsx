import { useLingui } from '@lingui/react/macro';
import { Maximize2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import * as styles from './SampleLanyard.styles';
import type { SampleLanyardProps } from './SampleLanyard.types';

/**
 * A real lanyard, live in a phone-sized frame from `md` up, and a link to
 * it on every screen (#145). Framed, the app sends no analytics, so the
 * sample doesn't count as a visit.
 */
export function SampleLanyard({ handle, className }: SampleLanyardProps) {
  const { t } = useLingui();
  const href = `/@${handle}`;
  return (
    <div className={cn(styles.sample, className)}>
      <p aria-hidden="true" className={styles.label}>
        {t`Sample lanyard`}
      </p>
      <div className={styles.frame}>
        <iframe
          src={href}
          title={t`Sample lanyard`}
          loading="lazy"
          className={styles.iframe}
        />
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        <Maximize2 aria-hidden="true" className={styles.icon} />
        {t`View sample profile`}{' '}
        <span className={styles.srOnly}>{t`(opens in a new tab)`}</span>
      </a>
    </div>
  );
}
