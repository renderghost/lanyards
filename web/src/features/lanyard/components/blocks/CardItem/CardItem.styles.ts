// A bordered card; its one link may cover it, so its focus ring and hover
// show on the card itself (#122).
export const card =
  'relative flex min-h-11 flex-wrap items-start gap-3 rounded-xl border border-border p-3 has-[a:hover]:bg-accent-subtle has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent';

// Hidden from visitors: dashed and tagged, in place.
export const hidden = 'border-dashed';

export const thumbnail =
  'flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-subtle text-accent-text [&_img]:size-full [&_img]:object-cover [&_svg]:size-6';

// At least 10rem: on a narrow card the controls wrap below the text
// rather than squeezing it.
export const content = 'flex min-w-0 flex-1 basis-40 flex-col gap-1';

// Only pictures fade: faded text would fall below 4.5:1 (WCAG 1.4.3).
export const faded = 'opacity-50 grayscale';

// Under the text, as a hidden block's header says it under its name.
export const tag =
  'self-start rounded-sm bg-accent-subtle px-1.5 text-xs font-medium leading-5 text-accent-text';

export const controls = 'flex shrink-0 items-start';
