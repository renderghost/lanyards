import type { Did } from '@atcute/lexicons';

import type { LanyardConfig } from '@/lib/person/config';

export type LanyardEditorProps = {
  did: Did;
  /** The draft (useLanyardDraft). */
  config: LanyardConfig;
  onChange(patch: (config: LanyardConfig) => LanyardConfig): void;
  disabled: boolean;
};
