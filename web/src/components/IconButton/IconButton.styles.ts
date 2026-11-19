import type { IconButtonVariant } from './IconButton.types';

export const base =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ui-text motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

export const variants: Record<IconButtonVariant, string> = {
  ghost: 'hover:bg-ui-surface-muted',
  outline:
    'border border-ui-border bg-ui-surface hover:border-ui-border-strong hover:bg-ui-surface-muted',
};

export const icon = 'inline-flex size-5 items-center justify-center *:size-5';
