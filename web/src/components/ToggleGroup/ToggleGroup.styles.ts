export const root =
  'inline-flex items-center gap-0.5 rounded-xl border border-ui-border bg-ui-surface-muted p-0.5';

// 36px to the eye, with a 44px hit area. The pressed option's ring keeps
// its state visible at 3:1 against the track (WCAG 1.4.11).
export const short = 'md:hidden';

export const full = 'hidden md:inline';

export const item =
  'relative inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-sm font-medium leading-5 text-ui-text-muted motion-safe:transition-colors hover:text-ui-text before:absolute before:inset-x-0 before:-inset-y-1 before:content-[""] aria-pressed:bg-ui-surface aria-pressed:text-ui-text aria-pressed:shadow-sm aria-pressed:ring-1 aria-pressed:ring-ui-border-strong';
