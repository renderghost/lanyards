import { useLingui } from '@lingui/react/macro';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

import * as styles from './OfflineBanner.styles';
import type { OfflineBannerProps } from './OfflineBanner.types';

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { t } = useLingui();
  const online = useOnlineStatus();
  // The live region stays mounted so screen readers announce the change.
  return (
    <p role="status" className={cn(!online && styles.banner, className)}>
      {online
        ? ''
        : t`You're offline. Some things won't work until you reconnect.`}
    </p>
  );
}
