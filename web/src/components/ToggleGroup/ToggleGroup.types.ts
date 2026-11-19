export type ToggleGroupOption<T extends string> = {
  value: T;
  /** The option's name, shown from the `md` breakpoint up. */
  label: string;
  /** Shown instead of `label` on small screens; `label` stays its name. */
  shortLabel?: string;
};

export type ToggleGroupProps<T extends string> = {
  value: T;
  onValueChange(value: T): void;
  /** The group's accessible name, e.g. "Preview mode". */
  label: string;
  options: ToggleGroupOption<T>[];
};
