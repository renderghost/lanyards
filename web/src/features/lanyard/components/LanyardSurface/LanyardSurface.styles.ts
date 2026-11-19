import type { LanyardSurfaceVariant } from './LanyardSurface.types';

export const variants: Record<LanyardSurfaceVariant, string> = {
  // Under the app's header, the lanyard's ground fills the page.
  page: 'flex w-full flex-1 flex-col bg-background text-foreground',
  // On the customiser's neutral canvas, the lanyard is its own page.
  card: 'flex w-full flex-col rounded-2xl border border-border bg-background text-foreground',
};
