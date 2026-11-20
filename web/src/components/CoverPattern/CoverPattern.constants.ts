/**
 * The composed patterns' drawing space: a wide cover, scaled to fill
 * whatever holds it and cropped at the sides on narrow screens.
 */
export const VIEW = { width: 1200, height: 240 } as const;

/** Brand ink: the trefoil on the hazard cover, the same in light and dark. */
export const INK = '#06011e';

/** Pixel clusters on a 20 px grid, in cells: fixed, never random. */
export const PIXEL_CELL = 20;
export const PIXEL_SHADOW = 5;
export const PIXELS: readonly (readonly [number, number])[] = [
  [1, 1],
  [2, 1],
  [3, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [5, 3],
  [2, 4],
  [3, 4],
  [8, 0],
  [9, 0],
  [9, 1],
  [10, 1],
  [11, 3],
  [7, 4],
  [8, 4],
  [10, 4],
  [8, 5],
];

/** The symbols cover's glyphs, from the & % badge: x, y, mark or partner. */
export const GLYPHS: readonly {
  glyph: string;
  x: number;
  y: number;
  partner: boolean;
}[] = [
  { glyph: '&', x: 30, y: 200, partner: false },
  { glyph: '%', x: 200, y: 300, partner: true },
  { glyph: '@', x: 380, y: 170, partner: false },
  { glyph: '/', x: 610, y: 250, partner: true },
  { glyph: '*', x: 760, y: 210, partner: false },
  { glyph: '+', x: 950, y: 285, partner: true },
  { glyph: '#', x: 1080, y: 175, partner: false },
];

/** One blade of the trefoil, around its centre; turned 0°, 120° and 240°. */
export const BLADE =
  'M -10 -17.32 L -35 -60.62 A 70 70 0 0 1 35 -60.62 L 10 -17.32 A 20 20 0 0 0 -10 -17.32 Z';

/** A wayfinding arrow in a 64 px tile, pointing up and to the right. */
export const ARROW = 'M6 24 H34 V10 L60 32 L34 54 V40 H6 Z';
