import { useLingui } from '@lingui/react/macro';
import { Eye, EyeOff } from 'lucide-react';

import { IconButton } from '@/components/IconButton/IconButton';

import * as styles from './RecordToggle.styles';
import type { RecordToggleProps } from './RecordToggle.types';

/**
 * Hides or shows one record, named by what pressing it will do. It stays
 * where it is, so focus stays on it; unavailable rather than disabled, so
 * it keeps focus then too.
 */
export function RecordToggle({
  title,
  hidden,
  onToggle,
  disabled = false,
}: RecordToggleProps) {
  const { t } = useLingui();
  return (
    <IconButton
      label={hidden ? t`Show ${title}` : t`Hide ${title}`}
      icon={hidden ? <EyeOff /> : <Eye />}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onToggle();
      }}
      className={styles.toggle}
    />
  );
}
