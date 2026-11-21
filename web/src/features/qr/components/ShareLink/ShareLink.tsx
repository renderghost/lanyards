import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { QrCode } from 'lucide-react';

import { useOwnPaths } from '@/hooks/useOwnPaths';
import { cn } from '@/lib/utils';

import * as styles from './ShareLink.styles';
import type { ShareLinkProps } from './ShareLink.types';

/**
 * "Share" in the header or on the badge: goes to your own Share page,
 * `/<handle>/share` (#150). Nothing when signed out.
 */
export function ShareLink({ tone = 'ui', className }: ShareLinkProps) {
  const { t } = useLingui();
  const own = useOwnPaths();
  if (!own) return null;
  return (
    <Link
      to="/$handle/share"
      params={{ handle: own.id }}
      className={cn(styles.tones[tone], className)}
    >
      <QrCode aria-hidden="true" className={styles.icon} />
      <span className={styles.labels[tone]}>{t`Share`}</span>
    </Link>
  );
}
