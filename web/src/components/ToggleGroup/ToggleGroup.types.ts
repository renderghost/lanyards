export type ToggleGroupOption<T extends string> = { value: T; label: string };

export type ToggleGroupProps<T extends string> = {
  value: T;
  onValueChange(value: T): void;
  /** The group's accessible name, e.g. "Preview mode". */
  label: string;
  options: ToggleGroupOption<T>[];
};
