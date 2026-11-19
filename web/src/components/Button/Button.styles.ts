import type { ButtonSize, ButtonTone, ButtonVariant } from './Button.types';

export const base =
  'relative inline-flex items-center justify-center gap-2 rounded-md px-4 font-medium motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

export const tones: Record<ButtonTone, Record<ButtonVariant, string>> = {
  ui: {
    primary: 'bg-ui-primary text-ui-on-primary hover:bg-ui-primary/90',
    secondary:
      'border border-ui-border-strong bg-ui-surface text-ui-text hover:bg-ui-surface-muted',
    ghost: 'text-ui-text hover:bg-ui-surface-muted',
  },
  accent: {
    primary: 'bg-accent text-on-accent hover:opacity-90',
    secondary:
      'border border-border bg-surface text-foreground hover:bg-accent-subtle',
    ghost: 'text-accent-text hover:bg-accent-subtle',
  },
};

export const sizes: Record<ButtonSize, string> = {
  // Dense toolbars: 36px to the eye, with a 44px hit area.
  sm: 'min-h-9 px-3 text-sm leading-5 before:absolute before:inset-x-0 before:-inset-y-1 before:content-[""]',
  md: 'min-h-11 text-base leading-6',
  lg: 'min-h-14 px-6 text-lg leading-7',
};

export const spinner =
  'size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin';
