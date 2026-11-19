import { useLingui } from '@lingui/react/macro';
import { useId, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { SOURCE_LABELS } from './BlockSection.constants';
import * as styles from './BlockSection.styles';
import type { BlockSectionProps } from './BlockSection.types';

/**
 * One lanyard block: heading, content, loading and (for owners) failures.
 * Content that throws while rendering never takes the page down (spec
 * §12.3): visitors don't see the block, and the owner can retry it.
 */
export function BlockSection({
  heading,
  status,
  failedSources = [],
  owner,
  onRetry,
  onCrash,
  editLinks = [],
  handle,
  note,
  controls,
  collapsed = false,
  children,
  className,
}: BlockSectionProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** The content threw while rendering. */
  const [crashed, setCrashed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  /** Each attempt mounts a fresh boundary, so the content renders again. */
  const [attempt, setAttempt] = useState(0);

  if (crashed && !owner) return null;

  const failed = failedSources.map((source) => i18n._(SOURCE_LABELS[source]));
  const showProblem = owner && (crashed || failed.length > 0);
  const sources = failed.join(', ');

  // Render again only once the fresh data is in: the cached data is what
  // crashed. Retry keeps focus while it waits, and keeps it if the content
  // still can't be shown.
  async function retryCrashed() {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
      setAttempt((count) => count + 1);
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={(!collapsed && status === 'loading') || undefined}
      data-collapsed={collapsed ? '' : undefined}
      className={cn(styles.section, collapsed && styles.collapsed, className)}
    >
      <div data-block-header="" className={styles.header}>
        {handle}
        <div className={styles.title}>
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className={styles.heading}
          >
            {heading}
          </h2>
          {note && <p className={styles.note}>{note}</p>}
        </div>
        {owner && editLinks.length > 0 && (
          <div className={styles.editLinks}>
            {editLinks.map((link) => (
              <ExternalLink
                tone="accent"
                key={link.url}
                href={link.url}
                className={styles.edit}
              >
                {link.label}
              </ExternalLink>
            ))}
          </div>
        )}
        {controls}
      </div>
      {!collapsed && status === 'loading' && (
        <div className={styles.skeleton} aria-hidden="true">
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </div>
      )}
      {!collapsed && status === 'ready' && (
        <ErrorBoundary
          key={attempt}
          onError={(error) => {
            setCrashed(true);
            onCrash?.(error);
          }}
          onRendered={() => {
            if (!crashed) return;
            // Recovered: the Retry button goes, so focus the block itself.
            setCrashed(false);
            headingRef.current?.focus();
          }}
        >
          {children}
        </ErrorBoundary>
      )}
      {!collapsed && showProblem && (
        <div className={styles.problem}>
          <p className={styles.problemText}>
            {crashed
              ? t`Couldn't show this block`
              : t`Couldn't load ${sources}`}
          </p>
          {onRetry && (
            <Button
              tone="accent"
              variant="secondary"
              loading={retrying}
              onClick={() => (crashed ? void retryCrashed() : void onRetry())}
            >
              {t`Retry`}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
