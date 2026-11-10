import type { ButtonSize, ButtonVariant } from './Button.types';

export const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 font-medium leading-6 motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:opacity-90',
  secondary:
    'border border-border bg-surface text-foreground hover:bg-accent-subtle',
  ghost: 'text-accent-text hover:bg-accent-subtle',
};

export const sizes: Record<ButtonSize, string> = {
  md: 'min-h-11 text-base',
  lg: 'min-h-14 px-6 text-lg',
};

export const spinner =
  'size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin';
