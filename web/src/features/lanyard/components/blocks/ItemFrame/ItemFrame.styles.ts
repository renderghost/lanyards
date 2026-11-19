export const frame = 'flex min-w-0 items-start gap-2';

// Hidden from visitors: dashed, tagged and still in its place.
export const hidden = 'rounded-md border border-dashed border-border p-2';

export const content = 'flex min-w-0 flex-1 flex-col gap-1';

// Only pictures fade: faded text would fall below 4.5:1 (WCAG 1.4.3).
export const faded = '[&_img]:opacity-50 [&_img]:grayscale [&_svg]:opacity-50';

export const tag =
  'shrink-0 self-center rounded-sm bg-accent-subtle px-1.5 text-xs font-medium leading-5 text-accent-text';
