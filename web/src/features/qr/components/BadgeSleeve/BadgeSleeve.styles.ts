// A clear plastic badge sleeve (#169, #170), on any lanyard ground: the
// plastic is white, a little opaque, and its lip has a slot where the
// clasp goes through, so the ground shows through the slot. Callers size
// it with their own classes, which win over these.

export const sleeve =
  'relative isolate w-full rounded-sm border border-white/60 bg-white/15 p-2.5 pt-8 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15),0_30px_60px_rgb(6_1_30/0.3)]';

export const slot =
  'absolute left-1/2 top-2.5 h-3 w-16 -translate-x-1/2 rounded-sm bg-qr-ground shadow-[inset_0_2px_3px_rgb(6_1_30/0.45)] ring-1 ring-white/60';

// Light on the plastic, over the badge. Anything that must keep its full
// contrast (a code to scan, a form) sits above it, at z-20.
export const glare =
  'pointer-events-none absolute inset-0 z-10 rounded-sm bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.22)_38%,transparent_47%,transparent_62%,rgb(255_255_255/0.12)_66%,transparent_72%)]';
