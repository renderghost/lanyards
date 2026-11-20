// The badge's ink strip (spec §7): cells separated by 1 px lines, which are
// the strip's own colour showing through the gaps.
export const board = 'flex flex-wrap gap-px bg-badge-line';

const cell = 'flex min-w-0 flex-col gap-1.5 bg-badge-ink px-6 py-5';

export const cells = {
  now: `${cell} flex-[2_1_26rem]`,
  based: `${cell} flex-[1_1_12.5rem]`,
  openTo: `${cell} flex-[1_1_15rem]`,
};

export const label =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-board-label';

export const value =
  'flex flex-wrap items-baseline gap-x-3.5 gap-y-1 text-lg font-semibold leading-[1.625rem] text-on-badge-ink [overflow-wrap:anywhere]';

export const more =
  'inline-flex items-center gap-1 text-[0.9375rem] font-semibold leading-5 text-board-label underline underline-offset-[3px] hover:decoration-2 focus-visible:outline-board-label';

export const arrow = 'size-4 shrink-0';
