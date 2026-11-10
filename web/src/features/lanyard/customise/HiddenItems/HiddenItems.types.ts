import type { HiddenItem } from '@/lib/person/blocks';

export type HiddenItemsProps = {
  items: HiddenItem[];
  onShow(key: string): void;
  disabled?: boolean;
  className?: string;
};
