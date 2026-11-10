import { msg } from '@lingui/core/macro';

import lexicon from '../../../../../lexicons/lanyards/app/lanyards/actor/biography/honorific.json';

export type Honorific = 'none' | 'Dr' | 'Prof';

/** The kept lexicon's closed enum, in its order (spec §10.4). */
export const HONORIFICS = lexicon.defs.main.record.properties.value
  .enum as Honorific[];

export const HONORIFIC_LABELS: Record<Honorific, ReturnType<typeof msg>> = {
  none: msg`None`,
  Dr: msg`Dr`,
  Prof: msg`Prof`,
};
