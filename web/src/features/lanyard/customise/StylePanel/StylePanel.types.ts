import type { LanyardConfig } from '@/lib/person/config';

export type StylePanelProps = {
  config: LanyardConfig;
  disabled: boolean;
  onChange(patch: (config: LanyardConfig) => LanyardConfig): void;
};
