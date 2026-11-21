// The brand pages' top bar (#151): no bar at all. The logo and Sign in sit
// on the brand blue, over the top of the badge's straps; the focus rings
// are the accent field's, which read on it in light and dark.
// 56px tall, as the app header is; installed on iPhone, it also clears
// the status bar / notch.
export const header =
  'absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-4 pb-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]';

export const homeLink =
  'inline-flex min-h-11 min-w-11 items-center rounded-sm focus-visible:outline-(--focus-ring-on-accent)';

/** Sign in: the badge's main button, white on the blue (#162). */
export const signIn = 'px-3 text-sm leading-5';
