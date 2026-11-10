export const group = 'flex flex-col gap-3';

export const label = 'text-base font-medium leading-6 text-foreground';

/** As many columns as fit with each name in full, from one at 320 px. */
export const options =
  'grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2';

export const option =
  'flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface px-3 text-left text-sm leading-5 text-foreground motion-safe:transition-colors hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:border-foreground data-[state=checked]:ring-2 data-[state=checked]:ring-foreground';

/** Scoped with data-accent, so each swatch shows its own palette. */
export const swatch = 'size-6 shrink-0 rounded-full bg-accent';
