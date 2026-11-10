export const row =
  'flex flex-col gap-3 rounded-md border border-border bg-surface p-3';

export const dragging = 'relative z-10 shadow-lg ring-2 ring-foreground';

export const top = 'flex min-w-0 items-center gap-2';

export const handle =
  'inline-flex size-11 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-60';

export const icon = 'size-5';

export const name =
  'min-w-0 flex-1 text-base font-medium leading-6 text-foreground [overflow-wrap:anywhere]';

export const switchRoot =
  'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-muted-foreground bg-surface motion-safe:transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-60 before:absolute before:-inset-2 before:content-[""]';

export const switchThumb =
  'block size-5 translate-x-0.5 rounded-full bg-muted-foreground shadow motion-safe:transition-transform data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:bg-on-accent';

export const controls = 'flex flex-wrap items-center gap-2';

export const move =
  'inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

export const limit =
  'flex items-center gap-2 text-sm leading-5 text-foreground';

export const select =
  'min-h-11 rounded-md border border-border bg-surface px-2 text-base leading-6 text-foreground disabled:cursor-not-allowed disabled:opacity-60';

export const status = 'flex flex-wrap items-center gap-x-3 gap-y-1';

export const statusText = 'text-sm leading-5 text-muted-foreground';

export const editLink =
  'text-sm leading-5 text-accent-text underline-offset-4 hover:underline';
