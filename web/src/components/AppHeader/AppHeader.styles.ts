// 56px tall; installed on iPhone, it also clears the status bar / notch.
export const header =
  'flex items-center justify-between gap-4 border-b border-ui-border bg-ui-surface px-4 pb-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]';

export const start = 'flex min-w-0 items-center gap-2 md:gap-4';

export const homeLink = 'inline-flex min-h-11 min-w-11 items-center rounded-sm';

/** Customise and View, from md up; on phones they're in the bottom bar. */
export const ownNav = 'hidden items-center gap-1 md:flex';

export const ownLink =
  'inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-sm font-medium leading-5 text-ui-text-muted hover:bg-ui-surface-muted hover:text-ui-text aria-[current=page]:bg-ui-surface-muted aria-[current=page]:text-ui-text';

export const icon = 'size-4 shrink-0';

export const end = 'flex min-w-0 items-center gap-2 md:gap-3';

/** Show QR and Account, from md up; on phones they're in the bottom bar. */
export const own = 'hidden items-center gap-1 md:flex';

/** Sign in, signed out: a primary button, sized for the bar (#162). */
export const signIn = 'px-3 text-sm font-semibold leading-5';
