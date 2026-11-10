/** How long a toast stays visible, in milliseconds. */
export const TOAST_DURATION_MS = 6000;

/** Keep toasts clear of the home indicator in the installed app. */
export const TOAST_OFFSET = {
  bottom: 'calc(24px + env(safe-area-inset-bottom))',
};
export const TOAST_MOBILE_OFFSET = {
  bottom: 'calc(16px + env(safe-area-inset-bottom))',
};
