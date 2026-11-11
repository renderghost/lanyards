export type NotifyAction = {
  label: string;
  onClick(): void;
};

export type NotifyOptions = {
  /** A toast shown again with the same id replaces the earlier one. */
  id?: string;
  action?: NotifyAction;
};
