import { cn } from '@/lib/utils';

import { base, sizes, spinner, variants } from './Button.styles';
import type { ButtonProps } from './Button.types';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading && <span className={spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
