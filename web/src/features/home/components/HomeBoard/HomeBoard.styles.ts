// The badge's ink departure board (spec §7), as a list: each row a
// numbered problem, rows separated by the board's own 1 px lines. Ink in
// light and dark alike, with a hairline edge on the dark ground.
export const board =
  'flex flex-col gap-px overflow-hidden rounded-sm bg-badge-line shadow-badge outline outline-1 -outline-offset-1 outline-border';

export const row =
  'grid gap-x-8 gap-y-2 bg-badge-ink px-5 py-5 md:grid-cols-[3rem_minmax(0,16rem)_minmax(0,1fr)] md:items-baseline md:px-8 md:py-6';

export const number =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-board-label';

export const title =
  'text-xl font-semibold leading-7 tracking-[-0.01em] text-on-badge-ink';

export const text = 'text-base leading-6 text-on-badge-ink/75';
