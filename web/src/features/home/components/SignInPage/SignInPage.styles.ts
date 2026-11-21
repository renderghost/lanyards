// The sign-in page (#157): the form on a badge, hanging on the brand blue
// as the homepage's does, but straight and still so the form is easy to
// use. The badge's tokens are the same in light and dark; the form keeps
// the app's own palette in a panel on the badge.

/** The page's ground: brand blue (the blue palette's accent). */
export const page = 'relative flex min-h-dvh flex-col bg-accent';

export const main =
  'flex flex-1 flex-col items-center px-4 pb-14 md:px-8 md:pb-20';

export const hang = 'flex w-full max-w-[34rem] flex-col items-center';

export const straps = 'h-24 w-[10rem] md:h-32 md:w-[12.5rem]';

export const badge =
  '@container flex w-full flex-col overflow-hidden rounded-sm bg-accent text-on-accent shadow-[0_2px_4px_rgb(6_1_30/0.2),0_12px_24px_rgb(6_1_30/0.2),0_32px_64px_rgb(6_1_30/0.3)]';

export const cover = 'relative h-24 @min-[30rem]:h-28';

/** Where the clip goes through the badge: the ground shows through. */
export const slot =
  'absolute left-1/2 top-3 h-3 w-14 -translate-x-1/2 rounded-sm bg-qr-ground shadow-[inset_0_2px_3px_rgb(6_1_30/0.4)]';

export const field =
  'flex flex-col gap-4 px-5 pb-6 @min-[30rem]:px-8 @min-[30rem]:pb-8';

/** Half the logo's height: the other half overlaps the cover. */
export const logoBox = 'h-10 @min-[30rem]:h-12';

export const logo =
  'size-20 -translate-y-1/2 shadow-[0_0_0_6px_var(--accent)] @min-[30rem]:size-24';

export const heading =
  'text-[clamp(2.5rem,12cqi,3.75rem)] font-extrabold leading-[0.9] tracking-[-0.04em]';

export const lede = 'max-w-[34ch] text-lg font-medium leading-7';

/** The form keeps the app's own palette: a card on the badge, full width. */
export const form = 'max-w-none shadow-[0_1px_2px_rgb(6_1_30/0.15)]';

/** While the session loads: the same card, saying so. */
export const loading =
  'rounded-sm border border-ui-border bg-ui-surface p-6 text-[15px] leading-[22px] text-ui-text-muted';
