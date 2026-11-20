// One line, never wider than its row; long labels truncate (#122).
export const pill =
  'inline-flex min-h-11 max-w-full items-center rounded-sm border border-border text-foreground';

// On the public lanyard: the pill's own padding.
export const plain = 'gap-2 px-4';

// The whole pill is the link.
export const link = 'no-underline hover:bg-accent-subtle hover:no-underline';

// In the customiser: the toggle sits inside the pill, on its right.
export const editing = 'gap-1 pr-0.5';

// Hidden from visitors: dashed, in place.
export const hidden = 'border-dashed';

// Fills the pill's height and its left end, so the link is a 44 px
// target beside the toggle.
export const content =
  'inline-flex min-w-0 items-center gap-2 self-stretch rounded-l-sm pl-4 text-foreground no-underline hover:no-underline';

// Only pictures fade: faded text would fall below 4.5:1 (WCAG 1.4.3).
export const faded = '[&_img]:opacity-50 [&_img]:grayscale [&_svg]:opacity-50';

export const label = 'truncate text-[15px] leading-[22px]';

export const srOnly = 'sr-only';
