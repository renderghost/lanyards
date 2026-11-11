import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { SOURCE_LABELS } from './BlockSection.constants';
import * as styles from './BlockSection.styles';
import type { BlockSectionProps } from './BlockSection.types';

/** One lanyard block: heading, content, loading and (for owners) failures. */
export function BlockSection({
  heading,
  status,
  failedSources = [],
  owner,
  crashed = false,
  onRetry,
  editLinks = [],
  children,
  className,
}: BlockSectionProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const failed = failedSources.map((source) => i18n._(SOURCE_LABELS[source]));
  const showProblem = owner && (crashed || failed.length > 0);
  const sources = failed.join(', ');

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={status === 'loading' || undefined}
      className={cn(styles.section, className)}
    >
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        {owner && editLinks.length > 0 && (
          <div className={styles.editLinks}>
            {editLinks.map((link) => (
              <ExternalLink
                key={link.url}
                href={link.url}
                className={styles.edit}
              >
                {link.label}
              </ExternalLink>
            ))}
          </div>
        )}
      </div>
      {status === 'loading' && (
        <div className={styles.skeleton} aria-hidden="true">
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </div>
      )}
      {status === 'ready' && children}
      {showProblem && (
        <div className={styles.problem}>
          <p className={styles.problemText}>
            {crashed
              ? t`Couldn't show this block`
              : t`Couldn't load ${sources}`}
          </p>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              {t`Retry`}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
