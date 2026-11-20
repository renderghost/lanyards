import type { ShowQrButtonTone } from './ShowQrButton.types';

export const tones: Record<ShowQrButtonTone, string> = {
  ui: 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 text-sm font-medium leading-5 text-ui-text hover:bg-ui-surface-muted sm:px-3',
  // On the badge's accent field (#129), beside Edit lanyard.
  badge:
    'inline-flex min-h-14 items-center justify-center gap-2 rounded-sm border-2 border-on-accent px-6 text-lg font-semibold leading-7 text-on-accent hover:bg-on-accent/10 focus-visible:outline-(--focus-ring-on-accent)',
};

export const icon = 'size-5 shrink-0';

/** In the header, icon only on small screens, so it fits at 320 px. */
export const labels: Record<ShowQrButtonTone, string> = {
  ui: 'sr-only sm:not-sr-only',
  badge: '',
};
