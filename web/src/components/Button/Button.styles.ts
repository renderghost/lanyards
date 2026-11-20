import type { ButtonSize, ButtonTone, ButtonVariant } from './Button.types';

export const base =
  'relative inline-flex items-center justify-center gap-2 px-4 font-medium motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

/** The focus ring on the badge's accent field (spec §7). */
export const BADGE_FOCUS = 'focus-visible:outline-(--focus-ring-on-accent)';

export const tones: Record<ButtonTone, Record<ButtonVariant, string>> = {
  ui: {
    primary:
      'rounded-sm bg-ui-primary text-ui-on-primary hover:bg-ui-primary/90',
    secondary:
      'rounded-sm border border-ui-border-strong bg-ui-surface text-ui-text hover:bg-ui-surface-muted',
    ghost: 'rounded-sm text-ui-text hover:bg-ui-surface-muted',
  },
  accent: {
    primary: 'rounded-sm bg-accent text-on-accent hover:opacity-90',
    secondary:
      'rounded-sm border border-border bg-surface text-foreground hover:bg-accent-subtle',
    ghost: 'rounded-sm text-accent-text hover:bg-accent-subtle',
  },
  // On the accent field: its own focus ring, which shows on every accent.
  badge: {
    primary: `${BADGE_FOCUS} rounded-sm bg-badge-button font-semibold text-on-badge-button shadow-[0_1px_2px_rgb(6_1_30/0.2),0_4px_10px_rgb(6_1_30/0.15)] hover:opacity-90`,
    secondary: `${BADGE_FOCUS} rounded-sm border-2 border-on-accent font-semibold text-on-accent hover:bg-on-accent/10`,
    ghost: `${BADGE_FOCUS} rounded-sm font-semibold text-on-accent hover:bg-on-accent/10`,
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
