export type ItemMenuProps = {
  /** The item's short name, for the menu button's label. */
  title: string;
  onHide(): void;
  className?: string;
};
