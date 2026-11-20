import type { LanyardConfig } from '@/lib/person/config';

export type StylePanelProps = {
  /** The owner: their cover until they pick one comes from their DID. */
  did: string;
  /** The owner's initials, for the monogram's preview. */
  initials: string;
  config: LanyardConfig;
  disabled: boolean;
  onChange(patch: (config: LanyardConfig) => LanyardConfig): void;
};
