// A clear plastic badge sleeve (#169, #170): a little opaque, with a lip
// whose slot is where the clasp goes through, so the ground shows through
// the slot. Callers size it with their own classes, which win over these.

export const sleeve = 'relative isolate w-full rounded-sm border p-2.5 pt-8';

export const slot =
  'absolute left-1/2 top-2.5 h-3 w-16 -translate-x-1/2 rounded-sm shadow-[inset_0_2px_3px_rgb(6_1_30/0.45)] ring-1';

/**
 * brand: white plastic on the brand blue or ink. page: on a page that may
 * be light or dark, edged in the page's own ink (#173). The page's has no
 * inset highlight: painting one across a badge that size held back the
 * lanyard's first paint by 0.1 s on a mid-range phone (spec §2).
 */
export const grounds = {
  brand: {
    sleeve:
      'border-white/60 bg-white/15 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15),0_30px_60px_rgb(6_1_30/0.3)]',
    slot: 'bg-qr-ground ring-white/60',
  },
  page: {
    sleeve:
      'border-foreground/20 bg-foreground/[0.03] shadow-[0_24px_48px_rgb(6_1_30/0.14)]',
    slot: 'bg-background ring-foreground/20',
  },
} as const;

// Light on the plastic, over the badge. Anything that must keep its full
// contrast (a code to scan, a form) sits above it, at z-20.
export const glare =
  'pointer-events-none absolute inset-0 z-10 rounded-sm bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.22)_38%,transparent_47%,transparent_62%,rgb(255_255_255/0.12)_66%,transparent_72%)]';
