import type { Ref } from 'react';

export type RecordEditActionsProps = {
  /** The record's short name, for the buttons' names. */
  title: string;
  onEdit(): void;
  onDelete(): void;
  /** Where focus returns when the record's form closes. */
  editRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
};
