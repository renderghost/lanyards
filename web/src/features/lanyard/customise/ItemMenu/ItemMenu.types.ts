export type ItemMenuProps = {
  /** The item's short name, for the menu button's label. */
  title: string;
  /** Hides the item; false when it couldn't be hidden. */
  onHide(): boolean;
  className?: string;
};
