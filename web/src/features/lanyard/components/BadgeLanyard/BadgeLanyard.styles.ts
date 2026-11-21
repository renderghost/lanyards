// A person's badge on their lanyard page (#173): in a laminate sleeve, on
// a lanyard in their accent, on a page that may be light or dark.

export const hang = 'flex w-full flex-col items-center';

// The clasp's hook ends in the sleeve's slot, a little below its top edge.
// The straps are cut cleanly where the box starts, before the shift down,
// so they run up to the header or the canvas's edge.
export const ribbon =
  'relative z-10 h-24 w-auto shrink-0 translate-y-[1.125rem] [clip-path:inset(-1.125rem_-100vw_-100vw)] sm:h-32 md:translate-y-7 md:[clip-path:inset(-1.75rem_-100vw_-100vw)]';

/** A bigger sleeve for the bigger badge. */
export const sleeve = 'md:p-4 md:pt-12';

export const slot = 'md:top-4 md:h-4 md:w-24';
