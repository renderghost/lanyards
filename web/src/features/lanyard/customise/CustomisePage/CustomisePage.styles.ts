// The route draws its own header, so it draws its <main> too.
export const main = 'flex flex-1 flex-col';

// The style sidebar (from md up), then the canvas holding the lanyard.
export const workspace = 'flex flex-1 items-stretch';

// The lanyard's own ground (LanyardSurface): no box round the lanyard.
export const canvas = 'min-w-0 items-center gap-6 px-4 py-6 md:px-8 md:py-8';

export const intro = 'flex w-full max-w-[640px] flex-col gap-3';

export const heading =
  'text-[22px] font-semibold leading-7 tracking-tight text-ui-text';

/** Empty but present, so the status is announced when it appears. */
export const moving =
  'text-[15px] leading-[22px] text-ui-text-muted empty:sr-only';

export const publicNote =
  'rounded-sm border border-ui-border bg-ui-surface px-4 py-3 text-[13px] leading-[18px] text-ui-text-muted';

export const frame = 'w-full max-w-[640px]';

// While the session loads, before the lanyard's ground is drawn.
export const loading =
  'px-4 py-6 text-[15px] leading-[22px] text-ui-text-muted';

export const notice =
  'flex flex-col items-start gap-3 rounded-sm border border-ui-border bg-ui-surface p-4';

export const noticeHeading =
  'text-[15px] leading-[22px] font-semibold text-ui-text';

export const noticeText = 'text-[15px] leading-[22px] text-ui-text-muted';
