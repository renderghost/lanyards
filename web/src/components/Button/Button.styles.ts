import type { ButtonSize, ButtonTone, ButtonVariant } from './Button.types';

export const base =
  'relative inline-flex items-center justify-center gap-2 px-4 font-medium motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

export const tones: Record<ButtonTone, Record<ButtonVariant, string>> = {
  ui: {
    primary:
      'rounded-lg bg-ui-primary text-ui-on-primary hover:bg-ui-primary/90',
    secondary:
      'rounded-lg border border-ui-border-strong bg-ui-surface text-ui-text hover:bg-ui-surface-muted',
    ghost: 'rounded-lg text-ui-text hover:bg-ui-surface-muted',
  },
  accent: {
    primary: 'rounded-md bg-accent text-on-accent hover:opacity-90',
    secondary:
      'rounded-md border border-border bg-surface text-foreground hover:bg-accent-subtle',
    ghost: 'rounded-md text-accent-text hover:bg-accent-subtle',
  },
};

export const sizes: Record<ButtonSize, string> = {
  // Dense toolbars: 36px to the eye. The ::before overhangs the padding
  // box (inside any border) by 6px above and below: 46px or more to hit.
  sm: 'min-h-9 px-3 text-sm leading-5 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[""]',
  md: 'min-h-11 text-base leading-6',
  lg: 'min-h-14 px-6 text-lg leading-7',
};

export const spinner =
  'size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin';
