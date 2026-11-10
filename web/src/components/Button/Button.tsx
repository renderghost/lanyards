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
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      // While loading the button stays focusable, so pressing it never
      // drops focus to the page; presses (and submits) are ignored.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading && <span className={spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
