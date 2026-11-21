// The Share badge (#169): a lanyard printed with the owner's handle, and
// their badge in a clear sleeve, in their accent, on brand blue (ink under
// a blue badge). Three layouts:
// - Phones: the lanyard and sleeve, then Share, Copy link and Close along
//   the foot. On short screens these give way, in order: the lanyard, the
//   card's top row, the strip. The code and the actions never go.
// - wide: Share, the name and the actions on the left; the lanyard on the
//   right, hanging from the top of the screen.
// - flat (short and sideways): the screen is the badge, in the accent: the
//   code as large as it allows, the details and actions beside it.
// Every class is written out in full: Tailwind only generates those.

export const overlay = 'fixed inset-0 z-40 bg-badge-ink';

export const content =
  'fixed inset-0 z-50 flex flex-col items-center gap-4 overflow-y-auto overflow-x-hidden bg-qr-ground px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-white focus:outline-none max-[22.5rem]:px-2 wide:grid wide:grid-cols-[minmax(0,26rem)_minmax(0,24rem)] wide:grid-rows-[1fr_auto_auto_1fr] wide:content-stretch wide:items-center wide:justify-center wide:gap-x-16 wide:gap-y-8 wide:px-8 flat:grid flat:grid-cols-[auto_minmax(0,20rem)] flat:grid-rows-[1fr_auto_auto_auto_1fr] flat:content-stretch flat:items-center flat:justify-center flat:gap-x-6 flat:gap-y-3 flat:bg-accent flat:px-6 flat:text-on-accent';

/** Share, the name and a hint: beside the lanyard where there's room. */
export const intro =
  'sr-only wide:not-sr-only wide:col-start-1 wide:row-start-2 wide:flex wide:flex-col wide:gap-4 wide:self-end';

export const eyebrow =
  'text-xs font-bold uppercase leading-4 tracking-[0.16em] text-white';

const title =
  'font-extrabold leading-[0.92] tracking-[-0.045em] text-white [overflow-wrap:anywhere]';

export const titles = {
  large: `${title} text-[4.25rem]`,
  medium: `${title} text-[3.25rem]`,
  small: `${title} text-[2.5rem]`,
};

export const hint = 'max-w-[34ch] text-lg font-medium leading-7 text-white';

/** The lanyard and the sleeve. */
export const hang =
  'relative flex w-full max-w-[22rem] flex-1 flex-col items-center justify-center max-[22.5rem]:max-w-none wide:col-start-2 wide:row-span-4 wide:row-start-1 wide:max-w-none wide:self-stretch flat:contents';

// The clasp's hook ends in the sleeve's slot, a little below its top edge.
export const ribbon =
  'relative z-10 h-28 w-auto shrink-0 translate-y-[1.125rem] [@media(max-height:44rem)]:hidden wide:h-44 flat:hidden';

// The sleeve (BadgeSleeve), a little tighter on the narrowest phones;
// sideways the screen is the badge, so there's no sleeve.
export const sleeve =
  'max-[22.5rem]:origin-[50%_0.875rem] max-[22.5rem]:p-1.5 max-[22.5rem]:pt-7 flat:contents';

export const slot = 'max-[22.5rem]:top-2 flat:hidden';

export const glare = 'flat:hidden';

export const card =
  'relative flex w-full flex-col overflow-hidden rounded-sm bg-accent text-on-accent flat:contents';

export const top =
  'flex items-center gap-2 px-4 pt-3.5 [@media(max-height:42rem)]:hidden flat:hidden';

export const mark = 'size-6';

export const site = 'text-sm font-extrabold leading-5 tracking-[-0.01em]';

export const scan =
  'relative z-20 flex flex-col items-center gap-2.5 px-4 pt-3.5 max-[22.5rem]:px-3 flat:contents';

// The code on white with its own quiet zone, at least 240 px wide.
export const code =
  'w-full overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgb(6_1_30/0.15)] flat:col-start-1 flat:row-span-5 flat:row-start-1 flat:size-[min(20rem,calc(100dvh-3rem),50vw)] flat:self-center';

/** The avatar over the code's centre, ringed in white. */
export const avatar =
  'size-full rounded-full bg-white object-cover ring-[3px] ring-white';

/** Without one, their initials on their accent. */
export const initials = {
  avatar:
    'flex size-full items-center justify-center rounded-full bg-accent text-[0.9375rem] font-extrabold leading-none text-on-accent ring-[3px] ring-white',
};

export const prompt =
  'text-center text-xs font-extrabold uppercase leading-4 tracking-[0.14em] flat:col-start-2 flat:row-start-3 flat:text-start';

export const who =
  'flex min-w-0 flex-col gap-1.5 px-4 pb-3.5 pt-3 max-[22.5rem]:px-3 flat:col-start-2 flat:row-start-2 flat:p-0';

const name =
  'font-extrabold leading-[0.94] tracking-[-0.035em] [overflow-wrap:anywhere] flat:text-[1.375rem] flat:leading-7';

export const names = {
  large: `${name} text-[2.25rem]`,
  medium: `${name} text-[1.875rem]`,
  small: `${name} text-[1.5rem]`,
};

export const meta =
  'text-sm font-semibold leading-5 [overflow-wrap:anywhere] [@media(max-height:40rem)]:hidden';

export const strip =
  'flex bg-badge-ink text-on-badge-ink [@media(max-height:40rem)]:hidden flat:hidden';

export const cell =
  'flex min-w-0 flex-1 flex-col gap-1 px-4 py-3 [&+&]:border-l [&+&]:border-board-label/40';

export const label =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-board-label';

// One line: the strip keeps its height.
export const value =
  'min-w-0 truncate text-[0.9375rem] font-semibold leading-5';

export const actions =
  'flex w-full max-w-[22rem] shrink-0 gap-2 max-[22.5rem]:max-w-none wide:col-start-1 wide:row-start-3 wide:max-w-none wide:gap-3 wide:self-start flat:col-start-2 flat:row-start-4 flat:max-w-none flat:flex-col';

// 56 px targets, for holding the phone out (spec §8). White on the blue or
// ink ground; sideways the ground is the accent, so they take the accent
// field's own colours and ring.
const action =
  'min-w-0 flex-1 px-3 text-base leading-6 focus-visible:outline-white wide:flex-none wide:px-6 flat:focus-visible:outline-(--focus-ring-on-accent)';

export const share = `${action} bg-white text-badge-ink hover:bg-white/90 flat:bg-badge-button flat:text-on-badge-button`;

export const copy = `${action} border-white text-white hover:bg-white/10 flat:border-on-accent flat:text-on-accent flat:hover:bg-on-accent/10`;

/** Dropped on the narrowest phones, so three controls fit across. */
export const icon = 'size-[1.125rem] shrink-0 max-[22.5rem]:hidden';

// With the actions on phones; in the corner where there's room, and
// sideways, drawn over the lanyard where a strap runs past (#170).
export const close =
  'relative z-30 flex size-14 shrink-0 items-center justify-center rounded-sm text-white hover:bg-white/10 focus-visible:outline-white wide:absolute wide:right-5 wide:top-5 flat:absolute flat:right-3 flat:top-3 flat:text-on-accent flat:hover:bg-on-accent/10 flat:focus-visible:outline-(--focus-ring-on-accent)';

export const closeIcon = 'size-6';
