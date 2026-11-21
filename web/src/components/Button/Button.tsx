import { spinner } from './Button.styles';
import type { ButtonProps } from './Button.types';
import { buttonClassName } from './buttonClassName';

export function Button({
  variant = 'primary',
  tone = 'ui',
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
      className={buttonClassName({ tone, variant, size, className })}
      {...rest}
    >
      {loading && <span className={spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
