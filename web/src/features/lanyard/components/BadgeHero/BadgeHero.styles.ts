// The billboard badge (spec §7). From 40rem up, sizes follow the badge's own
// width (a container query), not the window's, so the customiser's narrower
// canvas gets the narrow badge too. Write every class out in full: Tailwind
// only generates classes it finds in the source.

export const badge =
  '@container flex w-full flex-col overflow-hidden rounded-sm outline outline-1 -outline-offset-1 outline-border';

export const cover = 'relative h-30 @min-[40rem]:h-60';

export const field =
  'flex flex-wrap items-end gap-x-10 gap-y-6 bg-accent px-5 pb-6 text-on-accent @min-[40rem]:px-12 @min-[40rem]:pb-10';

export const identity = 'flex min-w-0 flex-[1_1_35rem] flex-col gap-4';

/** Half the avatar's height: the other half overlaps the cover. */
export const avatarBox = 'h-12 @min-[40rem]:h-17';

// The ring is the field's colour, so the avatar seems cut into the cover.
export const avatar =
  'flex size-24 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-badge-ink object-cover shadow-[0_0_0_6px_var(--accent)] @min-[40rem]:size-34';

export const initials =
  'text-[2rem] font-extrabold leading-none tracking-[-0.02em] text-board-label @min-[40rem]:text-[2.75rem]';

export const heading = 'flex min-w-0 flex-col gap-2.5';

// Never truncated: long words break anywhere.
export const name =
  'text-[clamp(2.75rem,9cqi,6.5rem)] font-extrabold leading-[0.92] tracking-[-0.035em] [overflow-wrap:anywhere]';

export const meta = 'text-lg font-semibold leading-6 [overflow-wrap:anywhere]';

export const headline =
  'max-w-[30ch] text-xl font-medium leading-7 tracking-[-0.01em] [overflow-wrap:anywhere] @min-[40rem]:text-[1.75rem] @min-[40rem]:leading-9';

export const actions = 'flex flex-wrap gap-2.5';
