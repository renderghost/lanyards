import type { HonorificValue } from '../../hooks/useKeptRecordsDraft';

export type HonorificControlProps = {
  value: HonorificValue;
  onChange(value: HonorificValue): void;
  disabled: boolean;
  className?: string;
};
