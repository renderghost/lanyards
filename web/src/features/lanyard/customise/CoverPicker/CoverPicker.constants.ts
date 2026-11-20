import { msg } from '@lingui/core/macro';

import type { CoverPattern } from '@/design/covers';

/** Each cover's visible name, shown under its preview. */
export const COVER_NAMES: Record<CoverPattern, ReturnType<typeof msg>> = {
  dots: msg`Dots`,
  stripes: msg`Stripes`,
  pixels: msg`Pixels`,
  orb: msg`Orb`,
  symbols: msg`Symbols`,
  hazard: msg`Hazard`,
  arrows: msg`Arrows`,
  monogram: msg`Monogram`,
};
