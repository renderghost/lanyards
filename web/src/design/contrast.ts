import { parse, wcagContrast } from 'culori';

/**
 * WCAG 2.x contrast ratio between two CSS colours (any syntax culori parses,
 * including oklch()). Throws if either colour cannot be parsed.
 */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parse(foreground);
  const bg = parse(background);
  if (!fg || !bg) {
    throw new Error(`Unparseable colour: ${!fg ? foreground : background}`);
  }
  return wcagContrast(fg, bg);
}
