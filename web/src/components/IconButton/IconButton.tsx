import { cn } from '@/lib/utils';

import { Tooltip } from '../Tooltip/Tooltip';
import * as styles from './IconButton.styles';
import type { IconButtonProps } from './IconButton.types';

/** An icon-only button: named by `label`, which its tooltip also shows. */
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  type = 'button',
  className,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(styles.base, styles.variants[variant], className)}
        {...rest}
      >
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}
