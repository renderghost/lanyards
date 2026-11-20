// Quiet, like the profile under the badge (spec §1): numbered rows on one
// block, separated by hairlines.
export const list =
  'flex flex-col overflow-hidden rounded-sm border border-border bg-surface shadow-block';

export const item =
  'grid gap-x-6 gap-y-2 border-b border-border px-5 py-6 last:border-b-0 md:grid-cols-[4rem_minmax(0,1fr)] md:px-8 md:py-7';

export const number =
  'text-[2rem] font-extrabold leading-none tracking-[-0.035em] text-accent-text';

export const copy = 'flex flex-col gap-2';

export const title = 'text-[18px] font-[650] leading-6 text-foreground';

export const text = 'text-base leading-6 text-muted-foreground';
