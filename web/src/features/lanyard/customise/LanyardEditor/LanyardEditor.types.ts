import type { Did } from '@atcute/lexicons';

import type { LanyardConfig } from '@/lib/person/config';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';

export type LanyardEditorProps = {
  did: Did;
  /** The draft (useLanyardDraft). */
  config: LanyardConfig;
  onChange(patch: (config: LanyardConfig) => LanyardConfig): void;
  disabled: boolean;
  /** The kept records' draft: links, podcasts and videos, the title. */
  records: UseKeptRecordsDraft;
  recordsDisabled: boolean;
};
