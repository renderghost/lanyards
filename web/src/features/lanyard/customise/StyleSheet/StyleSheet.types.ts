import type { StylePanelProps } from '../StylePanel/StylePanel.types';

export type StyleSheetProps = StylePanelProps & {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Puts focus back on the button that opened the sheet. */
  returnFocus?(): void;
};
