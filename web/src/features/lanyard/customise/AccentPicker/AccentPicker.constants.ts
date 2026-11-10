import { msg } from '@lingui/core/macro';

import type { Accent } from '@/design/accents';

/** Each accent's visible name, shown beside its swatch. */
export const ACCENT_NAMES: Record<Accent, ReturnType<typeof msg>> = {
  violet: msg`Violet`,
  indigo: msg`Indigo`,
  plum: msg`Plum`,
  rose: msg`Rose`,
  ember: msg`Ember`,
  moss: msg`Moss`,
  teal: msg`Teal`,
  ocean: msg`Ocean`,
};
