export type RecordToggleProps = {
  /** The record's short name, as in "Hide Personal site". */
  title: string;
  hidden: boolean;
  onToggle(): void;
  disabled?: boolean;
};
