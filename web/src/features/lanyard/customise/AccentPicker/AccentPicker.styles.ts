export const group = 'flex flex-col gap-3';

export const label = 'text-[15px] leading-[22px] font-semibold text-ui-text';

export const labelHidden = 'sr-only';

/** Labelled radio cards, two to a row. */
export const options = 'grid grid-cols-2 gap-2';

export const option =
  'flex min-h-11 items-center gap-3 rounded-sm border border-ui-border bg-ui-surface px-3 text-left text-sm leading-5 text-ui-text motion-safe:transition-colors hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:border-ui-primary data-[state=checked]:ring-2 data-[state=checked]:ring-ui-primary';

/** Scoped with data-accent, so each swatch shows its own palette. */
export const swatch = 'size-6 shrink-0 rounded-full bg-accent';
