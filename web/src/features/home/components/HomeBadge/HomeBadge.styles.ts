// Lanyards' own billboard badge (#145), in a clear sleeve on a lanyard
// printed with the site's address, on brand blue, as on the Share screen
// (#170), and built as a person's is (spec §7). The badge's tokens are the
// same in light and dark.

// Edge to edge: the ground the badge hangs on. It clips only sideways, so
// a badge swinging or turning never makes the page scroll, while the
// handle's suggestions on its back can hang below it (#176).
export const stage =
  'flex w-full flex-col items-center overflow-x-clip bg-qr-ground px-4 pb-14 md:px-8 md:pb-28';

export const hang = 'flex w-full max-w-[58rem] flex-col items-center';

// The clasp's hook ends in the sleeve's slot, a little below its top edge.
// Short enough that the badge sits in the middle of its blue (#174).
export const ribbon =
  'relative z-10 h-32 w-auto shrink-0 translate-y-[1.125rem] md:h-40 md:translate-y-7';

// What sways (#174): straight at rest, turning on the clasp, in the
// middle of its slot. Over what follows, so the handle's suggestions on
// its back are too (#176).
export const swing =
  'relative z-10 w-full origin-[50%_1rem] [perspective:2400px] md:origin-[50%_1.5rem]';

// What turns over (#175): both faces in one grid cell, so they share a
// size. Its back is half a turn round. With reduced motion it turns at
// once.
export const turn =
  'grid w-full [transform-style:preserve-3d] data-[face=back]:[transform:rotateY(180deg)] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.45,0,0.2,1)]';

const face =
  'flex flex-col [backface-visibility:hidden] [grid-area:1/1] md:p-4 md:pt-12';

export const front = face;

export const back = `${face} [transform:rotateY(180deg)]`;

/** A bigger slot for the bigger sleeve. */
export const slot = 'md:top-4 md:h-4 md:w-24';

/** It fills its face, however tall its back is. */
export const badge =
  '@container flex w-full flex-1 flex-col overflow-hidden rounded-sm bg-accent text-on-accent';

export const cover = 'relative h-30 @min-[40rem]:h-52';

export const field =
  'flex flex-1 flex-col gap-4 px-5 pb-8 @min-[40rem]:px-12 @min-[40rem]:pb-12';

/** Half the logo's height: the other half overlaps the cover. */
export const logoBox = 'h-12 @min-[40rem]:h-17';

// Where a person's avatar sits; the ring is the field's colour, so the
// logo seems cut into the cover.
export const logo =
  'size-24 -translate-y-1/2 shadow-[0_0_0_6px_var(--accent)] @min-[40rem]:size-34';

export const name =
  'text-[clamp(2.75rem,10cqi,7rem)] font-extrabold leading-[0.9] tracking-[-0.04em] [overflow-wrap:anywhere]';

export const statement =
  'max-w-[34ch] text-xl font-medium leading-7 tracking-[-0.01em] @min-[40rem]:text-[1.75rem] @min-[40rem]:leading-9';

// The ink strip: cells separated by 1 px lines, which are the strip's
// own colour showing through the gaps.
export const board = 'flex flex-wrap gap-px bg-badge-line';

export const cell =
  'flex min-w-0 flex-[1_1_12rem] flex-col gap-1.5 bg-badge-ink px-6 py-5';

export const label =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-board-label';

export const value =
  'text-lg font-semibold leading-[1.625rem] text-on-badge-ink [overflow-wrap:anywhere]';
