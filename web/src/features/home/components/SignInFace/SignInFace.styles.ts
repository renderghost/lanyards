// The homepage badge's back (#175): the sign-in form, built as the front
// is, at the front's size. The badge's tokens are the same in light and
// dark; the form keeps the app's own palette, in a panel on the badge.
// Nothing here clips, so the handle's suggestions hang out of the badge
// (#176): only the cover rounds its own corners.

export const badge =
  '@container flex w-full flex-1 flex-col rounded-sm bg-accent text-on-accent';

export const cover =
  'relative h-30 overflow-hidden rounded-t-sm @min-[40rem]:h-52';

// Beside each other where there's room: the welcome back, then the form.
export const field =
  'grid flex-1 content-start gap-x-12 gap-y-4 px-5 pb-8 @min-[40rem]:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] @min-[40rem]:px-12 @min-[40rem]:pb-12';

export const intro = 'flex flex-col gap-4';

/** Half the logo's height: the other half overlaps the cover. */
export const logoBox = 'h-12 @min-[40rem]:h-17';

// The ring is the field's colour, so the logo seems cut into the cover.
export const logo =
  'size-24 -translate-y-1/2 shadow-[0_0_0_6px_var(--accent)] @min-[40rem]:size-34';

export const heading =
  'text-[clamp(2.5rem,8cqi,4.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]';

export const lede =
  'max-w-[34ch] text-lg font-medium leading-7 @min-[40rem]:text-xl @min-[40rem]:leading-8';

/** The form's column: clear of the cover where they sit side by side. */
export const aside = 'flex flex-col @min-[40rem]:pt-10';

// The form keeps the app's own palette: a card on the badge, over the
// sleeve's glare so its text keeps its full contrast.
export const form =
  'relative z-20 max-w-none shadow-[0_1px_2px_rgb(6_1_30/0.15)]';

/** While the session loads: the same card, saying so. */
export const loading =
  'relative z-20 rounded-sm border border-ui-border bg-ui-surface p-6 text-[15px] leading-[22px] text-ui-text-muted';
