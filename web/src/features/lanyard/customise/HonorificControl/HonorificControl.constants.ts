import { msg } from '@lingui/core/macro';

import lexicon from '../../../../../lexicons/lanyards/app/lanyards/actor/biography/honorific.json';
import type { HonorificValue } from '../../hooks/useKeptRecordsDraft';

/** The kept lexicon's closed enum, in its order (spec §10.4). */
export const HONORIFICS = lexicon.defs.main.record.properties.value
  .enum as HonorificValue[];

export const HONORIFIC_LABELS: Record<
  HonorificValue,
  ReturnType<typeof msg>
> = {
  none: msg`None`,
  Dr: msg`Dr`,
  Prof: msg`Prof`,
};
