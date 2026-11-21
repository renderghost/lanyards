/**
 * The lanyard in its own units (#169): two straps meeting at a sewn tab,
 * then a swivel ring and a clasp whose hook ends at the bottom edge, where
 * the badge's slot is. The straps run far above the box, off the top of
 * the screen, as if round someone's neck.
 */
export const VIEW = { width: 320, height: 210 };

export const STRAPS = {
  left: 'M-130 -410 L150 150',
  right: 'M450 -410 L170 150',
  width: 44,
};

/** Enough repeats to print each strap from the top of any screen. */
export const REPEATS = 14;

export const SEPARATOR = '  ·  ';

/** The clasp's metal, light along its middle. */
export const METAL = ['#8d8ba3', '#f1f1f7', '#77758c'] as const;

/** What Lanyards' own lanyards print, where there's no person's handle. */
export const BRAND_PRINT = 'lanyards.app';
