import { msg } from '@lingui/core/macro';

import type { SourceName } from '@/lib/sources/result';

export const SOURCE_LABELS: Record<SourceName, ReturnType<typeof msg>> = {
  bluesky: msg`Bluesky`,
  sifa: msg`Sifa`,
  standardSite: msg`standard.site`,
  orcid: msg`ORCID`,
  tangled: msg`Tangled`,
  semble: msg`Semble`,
  lanyards: msg`Lanyards`,
};
