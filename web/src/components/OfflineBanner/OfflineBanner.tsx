import { useLingui } from '@lingui/react/macro';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

import * as styles from './OfflineBanner.styles';
import type { OfflineBannerProps } from './OfflineBanner.types';

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { t } = useLingui();
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <p role="status" className={cn(styles.banner, className)}>
      {t`You're offline. Some things won't work until you reconnect.`}
    </p>
  );
}
