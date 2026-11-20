// A bordered card (#122).
export const card =
  'group/card relative flex min-h-11 flex-wrap items-start gap-3 rounded-sm border border-border bg-surface p-3';

// On the public lanyard a card with a link opens it from a click anywhere,
// so it looks clickable, and shows its link's focus ring.
export const opens =
  'has-[a]:cursor-pointer has-[a]:hover:bg-accent-subtle has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus-ring';

// Hidden from visitors: dashed and tagged, in place.
export const hidden = 'border-dashed';

export const thumbnail =
  'flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-accent-subtle text-accent-text [&_img]:size-full [&_img]:object-cover [&_svg]:size-6';

// At least 10rem: on a narrow card the controls wrap below the text
// rather than squeezing it.
export const content = 'flex min-w-0 flex-1 basis-40 flex-col gap-1';

// Only pictures fade: faded text would fall below 4.5:1 (WCAG 1.4.3).
export const faded = 'opacity-50 grayscale';

// Under the text, as a hidden block's header says it under its name.
export const tag =
  'self-start rounded-xs bg-accent-subtle px-1.5 text-xs font-medium leading-5 text-accent-text';

export const controls = 'flex shrink-0 items-start';

// A muted arrow on a card that opens a link (#128); decorative.
export const arrow =
  'hidden size-[18px] shrink-0 self-center text-muted-foreground group-has-[a]/card:block';
