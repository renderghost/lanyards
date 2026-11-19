import { useLingui } from '@lingui/react/macro';

import { safeHref } from '@/lib/normalise';
import { cn } from '@/lib/utils';

import * as styles from './ExternalLink.styles';
import type { ExternalLinkProps } from './ExternalLink.types';

/**
 * A link to another site from record content. Only https, http and mailto
 * URLs become links; anything else renders as plain text.
 */
export function ExternalLink({
  href,
  children,
  tone = 'ui',
  label,
  className,
}: ExternalLinkProps) {
  const { t } = useLingui();
  const safe = safeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label} ${t`(opens in a new tab)`}` : undefined}
      className={cn(styles.tones[tone], className)}
    >
      {children}{' '}
      <span className={styles.srOnly}>{t`(opens in a new tab)`}</span>
    </a>
  );
}
