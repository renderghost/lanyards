/**
 * The lanyard in its own units (#169): two straps meeting at a sewn tab,
 * then a swivel ring and a clasp whose hook ends at the bottom edge, where
 * the badge's slot is. The straps run far above the box, off the top of
 * the screen, as if round someone's neck.
 */
export const VIEW = { width: 320, height: 210 };

export const STRAPS = {
  /** Each strap, from far above the box down to the tab, as [x, y]. */
  left: { from: [-130, -410], to: [150, 150] },
  right: { from: [450, -410], to: [170, 150] },
  width: 44,
} as const;

/** The hairline each side of an edged strap (#173). */
export const EDGE = 1;

/** Enough repeats to print each strap from the top of any screen. */
export const REPEATS = 14;

export const SEPARATOR = '  ·  ';

/** The clasp's metal, light along its middle. */
export const METAL = ['#8d8ba3', '#f1f1f7', '#77758c'] as const;

/** What Lanyards' own lanyards print, where there's no person's handle. */
export const BRAND_PRINT = 'lanyards.app';

/** A strap's path, its foot moved `shift` units sideways with the tab. */
export function strapPath(side: 'left' | 'right', shift = 0): string {
  const { from, to } = STRAPS[side];
  const foot = Math.round((to[0] + shift) * 100) / 100;
  return `M${from[0]} ${from[1]} L${foot} ${to[1]}`;
}
