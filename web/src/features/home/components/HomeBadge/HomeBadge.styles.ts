// Lanyards' own billboard badge (#145), hung from its straps on brand
// blue as on the Show QR screen (spec §8), and built as a person's is
// (spec §7). The badge's tokens are the same in light and dark.

/** Edge to edge: the ground the badge hangs on. */
export const stage =
  'flex w-full flex-col items-center overflow-hidden bg-qr-ground px-4 pb-14 md:px-8 md:pb-20';

export const hang = 'flex w-full max-w-[58rem] flex-col items-center';

export const straps = 'h-28 w-[11.75rem] md:h-40 md:w-[16.75rem]';

// Tilted on its clip from md up, after one swing as it arrives. A mouse
// sways it on the same clip (#151), with a transform added to the tilt.
export const badge =
  '@container flex w-full origin-top flex-col overflow-hidden rounded-sm bg-accent text-on-accent shadow-[0_2px_4px_rgb(6_1_30/0.2),0_12px_24px_rgb(6_1_30/0.2),0_32px_64px_rgb(6_1_30/0.3)] md:-rotate-[1.5deg] md:motion-safe:animate-swing';

export const cover = 'relative h-30 @min-[40rem]:h-52';

/** Where the clip goes through the badge: the ground shows through. */
export const slot =
  'absolute left-1/2 top-3.5 h-3 w-16 -translate-x-1/2 rounded-sm bg-qr-ground shadow-[inset_0_2px_3px_rgb(6_1_30/0.4)] @min-[40rem]:top-[1.125rem] @min-[40rem]:h-3.5 @min-[40rem]:w-24';

export const field =
  'flex flex-col gap-4 px-5 pb-8 @min-[40rem]:px-12 @min-[40rem]:pb-12';

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
