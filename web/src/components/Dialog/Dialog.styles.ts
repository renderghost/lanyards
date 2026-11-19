export const overlay = 'fixed inset-0 z-40 bg-black/40';

// A full-width sheet on phones; a centred panel from sm up.
export const content =
  'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-xl border border-ui-border bg-ui-surface pb-[env(safe-area-inset-bottom)] text-ui-text shadow-lg focus-visible:outline-none sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-0';

export const header =
  'flex items-center justify-between gap-3 border-b border-ui-border py-1 pl-4 pr-1';

export const title = 'text-[17px] font-semibold leading-6 text-ui-text';

export const body = 'min-h-0 overflow-y-auto p-4';
