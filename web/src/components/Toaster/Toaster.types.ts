export type NotifyAction = {
  label: string;
  onClick(): void;
};

export type NotifyOptions = {
  action?: NotifyAction;
};
