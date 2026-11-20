// Every block is framed, so its bounds are clear (#122).
// Opaque on the lanyard's ground, so a block being dragged never shows the
// one beneath it.
export const section =
  'flex flex-col gap-3 rounded-sm border border-border bg-background p-4';

// Hidden from visitors: only its header row, in a dashed frame.
export const collapsed = 'border-dashed py-2';

// One row: handle, name, Edit-on links, controls; it wraps on phones.
export const header = 'flex flex-wrap items-center gap-x-3 gap-y-1';

// At least 10rem, so on phones the controls wrap below the name rather
// than squeezing it.
export const title = 'flex min-w-0 flex-1 basis-40 flex-col';

export const note = 'text-sm leading-5 text-muted-foreground';

export const editLinks = 'flex flex-wrap gap-x-3 gap-y-1';

export const heading =
  'font-sans text-[18px] font-[650] leading-6 text-foreground';

export const edit =
  'inline-flex min-h-11 shrink-0 items-center text-sm leading-5 text-accent-text underline-offset-4 hover:underline';

export const skeleton = 'flex flex-col gap-2';

export const skeletonLine =
  'h-5 w-full rounded-xs bg-accent-subtle motion-safe:animate-pulse';

export const problem =
  'flex flex-wrap items-center gap-3 rounded-sm border border-border px-4 py-3';

export const problemText = 'text-sm leading-5 text-muted-foreground';
