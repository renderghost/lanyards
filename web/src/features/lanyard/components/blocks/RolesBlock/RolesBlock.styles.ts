// Rows divided by hairlines, not cards: a role opens nothing (spec §9).
export const list = 'flex flex-col divide-y divide-border';

export const item = 'py-3.5 first:pt-0 last:pb-0';

export const row = 'flex items-start gap-3.5';

export const tile =
  'flex size-10 shrink-0 items-center justify-center rounded-sm bg-subtle text-[0.9375rem] font-extrabold leading-5 text-muted-foreground ring-1 ring-inset ring-border';

export const text = 'flex min-w-0 flex-1 flex-col gap-0.5';

export const title =
  'text-base font-[650] leading-[1.375rem] text-foreground [overflow-wrap:anywhere]';

export const company =
  'text-[0.9375rem] leading-[1.375rem] text-muted-foreground [overflow-wrap:anywhere]';

export const aside = 'flex shrink-0 flex-col items-end gap-1.5';

export const now =
  'rounded-xs bg-accent px-1.5 py-0.5 text-[0.6875rem] font-extrabold uppercase leading-[0.875rem] tracking-[0.12em] text-on-accent';

export const dates =
  'text-sm leading-5 text-muted-foreground tabular-nums whitespace-nowrap';
