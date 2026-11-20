// The Show QR badge (spec §8). Upright: the straps, then the card in the
// owner's accent, then the actions, on brand blue (ink under a blue card).
// On short screens these give way, in order: the straps, the cover (to
// 56 px, then gone), the pronouns and handle, the ink strip. The name, the
// code and the actions never go. Sideways: the code as large as the screen
// allows, the card's details beside it, on the accent itself.
// Every class is written out in full: Tailwind only generates those.

export const overlay = 'fixed inset-0 z-40 bg-badge-ink';

export const content =
  'fixed inset-0 z-50 flex flex-col items-center justify-center-safe gap-4 overflow-y-auto bg-qr-ground px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] focus:outline-none max-[22.5rem]:px-0 landscape:grid landscape:grid-cols-[auto_minmax(0,20rem)] landscape:grid-rows-[1fr_auto_auto_auto_1fr] landscape:content-stretch landscape:items-center landscape:justify-center landscape:gap-x-6 landscape:bg-accent landscape:px-6 landscape:text-on-accent';

export const badge =
  'flex w-full max-w-[22rem] flex-col items-center max-[22.5rem]:max-w-none landscape:contents';

export const straps =
  'hidden [@media(min-height:52rem)]:block landscape:hidden';

export const card =
  'flex w-full flex-col overflow-hidden rounded-sm bg-accent text-on-accent shadow-[0_2px_4px_rgb(6_1_30/0.2),0_12px_24px_rgb(6_1_30/0.2),0_32px_64px_rgb(6_1_30/0.3)] max-[22.5rem]:rounded-none landscape:contents';

export const cover =
  'relative h-24 shrink-0 [@media(max-height:45.5rem)]:h-14 [@media(max-height:42.5rem)]:hidden landscape:hidden';

/** Where the clip goes through the badge. */
export const slot =
  'absolute left-1/2 top-3.5 h-3 w-16 -translate-x-1/2 rounded-sm bg-qr-ground shadow-[inset_0_2px_3px_rgb(6_1_30/0.4)]';

export const body = 'flex flex-col gap-4 px-5 pb-4 pt-5 landscape:contents';

export const identity =
  'flex min-w-0 flex-col gap-2 landscape:col-start-2 landscape:row-start-2';

const name =
  'font-extrabold leading-[0.92] tracking-[-0.035em] [overflow-wrap:anywhere] landscape:text-[1.375rem] landscape:leading-7';

export const names = {
  large: `${name} text-[2.875rem]`,
  medium: `${name} text-[2.125rem]`,
  small: `${name} text-[1.625rem]`,
};

export const role =
  'text-base font-bold leading-[1.375rem] [overflow-wrap:anywhere]';

export const meta =
  'text-sm font-semibold leading-5 [overflow-wrap:anywhere] [@media(max-height:40.5rem)]:hidden';

export const scan =
  'flex w-full flex-col items-center gap-2.5 landscape:contents';

// The code on white with its own quiet zone, at least 240 px wide: on
// screens up to 360 px the card runs edge to edge to keep it so.
export const code =
  'w-full max-w-72 overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgb(6_1_30/0.15)] landscape:col-start-1 landscape:row-span-5 landscape:row-start-1 landscape:size-[min(20rem,calc(100dvh-3rem),50vw)] landscape:max-w-none landscape:self-center';

export const description =
  'text-center text-xs font-extrabold uppercase leading-4 tracking-[0.14em] landscape:col-start-2 landscape:row-start-3 landscape:text-start';

export const strip =
  'flex items-center gap-3 bg-badge-ink px-5 py-3 text-on-badge-ink [@media(max-height:36rem)]:hidden landscape:hidden';

export const based = 'flex min-w-0 flex-1 items-center gap-3';

export const label =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-board-label';

// One line: the strip keeps its height; the lanyard has the full place.
export const value =
  'min-w-0 truncate text-[0.9375rem] font-semibold leading-5';

export const site =
  'shrink-0 text-[0.8125rem] font-bold leading-4 tracking-[0.04em] text-board-label';

export const actions =
  'flex w-full max-w-[22rem] gap-3 max-[22.5rem]:max-w-none max-[22.5rem]:px-4 landscape:col-start-2 landscape:row-start-4 landscape:flex-col landscape:px-0';

// White and ink, the same on every accent. The ring is white on the blue
// or ink ground; sideways the ground is the accent, so it takes the accent
// field's own ring (ink on mint, lime and pink; white on blue).
const action =
  'flex-1 focus-visible:outline-white landscape:focus-visible:outline-(--focus-ring-on-accent)';

export const copy = `${action} bg-white text-badge-ink hover:bg-white/90`;

export const close = `${action} bg-qr-close text-white hover:opacity-90`;
