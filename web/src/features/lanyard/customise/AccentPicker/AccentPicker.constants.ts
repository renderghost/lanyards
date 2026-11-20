import { msg } from '@lingui/core/macro';

import type { Accent } from '@/design/accents';

/** Each accent's visible name, shown beside its swatch. */
export const ACCENT_NAMES: Record<Accent, ReturnType<typeof msg>> = {
  blue: msg`Blue`,
  mint: msg`Mint`,
  lime: msg`Lime`,
  pink: msg`Pink`,
};
