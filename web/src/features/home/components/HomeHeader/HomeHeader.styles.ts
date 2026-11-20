// The homepage's top bar (#151): no bar at all. The logo and actions sit
// on the brand blue, over the top of the badge's straps; text and focus
// rings are the accent field's, which read on it in light and dark.
// 56px tall, as the app header is; installed on iPhone, it also clears
// the status bar / notch.
export const header =
  'absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-4 pb-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]';

export const homeLink =
  'inline-flex min-h-11 min-w-11 items-center rounded-sm focus-visible:outline-(--focus-ring-on-accent)';

export const actions = 'flex items-center gap-1';

export const signIn =
  'inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold leading-5 text-on-accent hover:bg-on-accent/10 focus-visible:outline-(--focus-ring-on-accent)';

export const signUp = 'px-3 text-sm leading-5';
