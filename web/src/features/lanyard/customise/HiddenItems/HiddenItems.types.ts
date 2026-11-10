import type { HiddenItem } from '@/lib/person/blocks';

export type HiddenItemsProps = {
  items: HiddenItem[];
  onShow(key: string): void;
  disabled?: boolean;
  /** An entry to focus once it shows, e.g. the item just hidden. */
  focusKey?: string;
  /** Called once `focusKey`'s entry has focus. */
  onFocused?(): void;
  className?: string;
};
