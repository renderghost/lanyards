// Phones only (#150): sticky at the foot of the page, clearing the home
// indicator in the installed app. Show QR, the main thing on a phone at a
// conference, is the wide filled button.
export const bar =
  'sticky bottom-0 z-30 grid grid-cols-[1fr_1fr_2fr_1fr] items-center gap-1 border-t border-ui-border bg-ui-surface px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden';

export const tab =
  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-sm px-1 text-xs font-medium leading-4 text-ui-text-muted hover:bg-ui-surface-muted aria-[current=page]:text-ui-text';

export const icon = 'size-5 shrink-0';

export const showQr =
  'flex min-h-12 items-center justify-center gap-2 rounded-sm bg-ui-primary px-3 text-base font-semibold leading-6 text-ui-on-primary hover:bg-ui-primary/90';

export const avatar = 'size-5 rounded-full bg-ui-surface-muted object-cover';
