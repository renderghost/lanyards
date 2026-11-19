// dnd-kit sets the move transition inline; motion-reduce overrides it.
export const row =
  'flex flex-col gap-3 rounded-xl border border-ui-border bg-ui-surface p-3 motion-reduce:transition-none!';

export const dragging = 'relative z-10 shadow-lg ring-2 ring-ui-primary';

export const top = 'flex min-w-0 items-center gap-2';

export const handle =
  'inline-flex size-11 shrink-0 cursor-grab items-center justify-center rounded-md text-ui-text-muted hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-60';

export const icon = 'size-5';

export const name =
  'min-w-0 flex-1 text-[15px] leading-[22px] font-semibold text-ui-text [overflow-wrap:anywhere]';

export const switchRoot =
  'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-ui-border-strong bg-ui-surface motion-safe:transition-colors data-[state=checked]:border-ui-primary data-[state=checked]:bg-ui-primary disabled:cursor-not-allowed disabled:opacity-60 before:absolute before:-inset-2 before:content-[""]';

export const switchThumb =
  'block size-5 translate-x-0.5 rounded-full bg-ui-border-strong shadow motion-safe:transition-transform data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:bg-ui-on-primary';

export const controls = 'flex flex-wrap items-center gap-2';

export const move =
  'inline-flex size-11 items-center justify-center rounded-md border border-ui-border bg-ui-surface text-ui-text hover:bg-ui-surface-muted disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

export const limit = 'flex items-center gap-2 text-sm leading-5 text-ui-text';

export const select =
  'min-h-11 rounded-md border border-ui-border-strong bg-ui-surface px-2 text-base leading-6 text-ui-text disabled:cursor-not-allowed disabled:opacity-60';

export const status = 'flex flex-wrap items-center gap-x-3 gap-y-1';

export const statusText = 'text-[13px] leading-[18px] text-ui-text-muted';

export const editLink =
  'inline-flex min-h-11 items-center text-[13px] leading-[18px] text-ui-primary underline-offset-4 hover:underline';
